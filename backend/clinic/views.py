from django.db import transaction
from rest_framework.exceptions import ValidationError
from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import *
from .serializers import *
from users.permissions import IsNurse, IsDoctor, IsAdminOrDoctor, IsAdmin
import datetime
import io
import csv

# View สำหรับจัดการนัดหมาย
class AppointmentViewSet(viewsets.ModelViewSet):
    queryset = Appointment.objects.all().order_by('appointment_date', 'start_time')
    serializer_class = AppointmentSerializer
    permission_classes = [IsAuthenticated]

# View สำหรับจัดการคิวประจำวัน
class DailyQueueViewSet(viewsets.ModelViewSet):
    queryset = DailyQueue.objects.all().order_by('priority', 'created_at')
    serializer_class = DailyQueueSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        today = datetime.date.today()
        queryset = DailyQueue.objects.filter(queue_date=today).order_by('priority', 'created_at')
        user = self.request.user
        
        if user.is_doctor():
            queryset = queryset.filter(doctor=user)
            
        return queryset

    @action(detail=True, methods=['patch'], url_path='change_status')
    def change_status(self, request, pk=None):
        queue = self.get_object()
        serializer = QueueStatusUpdateSerializer(data=request.data)

        if serializer.is_valid():
            new_status = serializer.validated_data['status']
            doctor_id = serializer.validated_data.get('doctor_id')
            current_status = queue.status

            allowed_transitions = {
                'waiting': ['waiting_vitals', 'cancelled'],
                'waiting_vitals': ['waiting_doctor', 'cancelled'],
                'waiting_doctor': ['in_progress', 'cancelled'],
                'in_progress': ['waiting_payment', 'waiting_medicine', 'cancelled'],
                'waiting_payment': ['waiting_medicine', 'completed', 'cancelled'],
                'waiting_medicine': ['waiting_payment', 'completed', 'cancelled'],
                'completed': [],
                'cancelled': []
            }

            if new_status != current_status and new_status not in allowed_transitions.get(current_status, []):
                return Response(
                    {"error": f"ไม่สามารถเปลี่ยนสถานะจาก {current_status} เป็น {new_status} ได้"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            if new_status == 'waiting_doctor':
                if not doctor_id:
                    return Response(
                        {"error": "กรุณาระบุแพทย์ผู้ทำการตรวจ"},
                        status=status.HTTP_400_BAD_REQUEST
                    )
                queue.doctor_id = doctor_id

            if new_status == 'in_progress':
                if not request.user.is_doctor():
                    return Response(
                        {"error": "เฉพาะแพทย์เท่านั้นที่สามารถเริ่มตรวจผู้ป่วยได้"},
                        status=status.HTTP_403_FORBIDDEN
                    )

                queue.doctor = request.user

            queue.status = new_status
            queue.save()

            return Response({
                "message": f"เปลี่ยนสถานะคิวเป็น {new_status} เรียบร้อยแล้ว"
            })

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# View สำหรับจัดการ Vital Sign
class VitalViewSet(viewsets.ModelViewSet):
    queryset = Vital.objects.all().order_by('-recorded_at')
    serializer_class = VitalSerializer

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            permission_classes = [IsNurse]
        else:
            permission_classes = [IsAuthenticated]

        return [permission() for permission in permission_classes]

    @transaction.atomic
    def perform_create(self, serializer):
        queue = serializer.validated_data['daily_queue']

        if queue.status != 'waiting_vitals':
            raise ValidationError({
                "daily_queue": "คิวนี้ไม่ได้อยู่ในสถานะรอวัดสัญญาณชีพ"
            })

        serializer.save(recorded_by=self.request.user)

        queue.status = 'waiting_doctor'
        queue.save()


# View สำหรับจัดการประวัติการรักษา
class MedicalRecordViewSet(viewsets.ModelViewSet):
    queryset = MedicalRecord.objects.all().order_by('-created_at')
    serializer_class = MedicalRecordSerializer

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            permission_classes = [IsDoctor]
        else:
            permission_classes = [IsAuthenticated]

        return [permission() for permission in permission_classes]

    @transaction.atomic
    def perform_create(self, serializer):
        queue = serializer.validated_data.get('daily_queue')

        if queue:
            if queue.status != 'in_progress':
                raise ValidationError({
                    "daily_queue": "คิวนี้ต้องอยู่ในสถานะกำลังตรวจ กรุณาเรียกผู้ป่วยเข้าตรวจก่อน"
                })

        serializer.save(doctor=self.request.user)
        
        patient = serializer.validated_data.get('patient')
        today = datetime.date.today()
        FollowUp.objects.filter(
            patient=patient,
            follow_up_date=today,
            status='checked_in'
        ).update(status='completed')

# View สำหรับจัดการนัดติดตามผล
class FollowUpViewSet(viewsets.ModelViewSet):
    queryset = FollowUp.objects.all().order_by('follow_up_date', 'follow_up_time')
    serializer_class = FollowUpSerializer

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            permission_classes = [IsDoctor]
        elif self.action == 'check_in':
            permission_classes = [IsNurse]
        else:
            permission_classes = [IsAuthenticated]

        return [permission() for permission in permission_classes]

    def perform_create(self, serializer):
        medical_record = serializer.validated_data['medical_record']

        serializer.save(
            patient=medical_record.patient,
            doctor=self.request.user,
            status='scheduled'
        )

    @action(detail=True, methods=['post'], url_path='check_in')
    def check_in(self, request, pk=None):
        follow_up = self.get_object()

        if follow_up.status != 'scheduled':
            return Response(
                {'error': 'นัดหมายนี้ถูกเช็กอินหรือยกเลิกไปแล้ว'},
                status=status.HTTP_400_BAD_REQUEST
            )

        today = datetime.date.today()
        count_today = DailyQueue.objects.filter(queue_date=today).count()
        new_queue_number = f"A{(count_today + 1):03d}"

        queue = DailyQueue.objects.create(
            queue_number=new_queue_number,
            patient=follow_up.patient,
            doctor=follow_up.doctor,
            queue_type='appointment',
            priority=1,
            status='waiting'
        )

        follow_up.status = 'checked_in'
        follow_up.save()

        return Response({
            'message': 'เช็กอินเรียบร้อยแล้ว',
            'queue_number': queue.queue_number
        })

    @action(detail=False, methods=['get'], url_path='my_upcoming')
    def my_upcoming(self, request):
        if not request.user.is_doctor():
            return Response(
                {"error": "เฉพาะแพทย์เท่านั้นที่สามารถดูตารางนัดของตนเองได้"},
                status=status.HTTP_403_FORBIDDEN
            )

        today = datetime.date.today()
        next_week = today + datetime.timedelta(days=7)

        appointments = FollowUp.objects.filter(
            doctor=request.user,
            follow_up_date__range=[today, next_week],
            status__in=['scheduled', 'checked_in']
        ).order_by('follow_up_date', 'follow_up_time')

        serializer = self.get_serializer(appointments, many=True)
        return Response(serializer.data)

class ICD10ViewSet(viewsets.ModelViewSet):
    queryset = ICD10.objects.all().order_by('code')
    serializer_class = ICD10Serializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['code', 'description_th']
    
    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            permission_classes = [IsAuthenticated]
        else:
            permission_classes = [IsAdmin]
            
        return [permission() for permission in permission_classes]
    
    @action(detail=False, methods=['post'], url_path='import')
    def import_csv(self, request):
        file = request.FILES.get('file')
        
        if not file:
            return Response({"error": "กรุณาแนบไฟล์ CSV"}, status=status.HTTP_400_BAD_REQUEST)
        
        if not file.name.endswith('.csv'):
            return Response({"error": "รองรับเฉพาะไฟล์นามสกุล .csv เท่านั้น"}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            decoded_file = file.read().decode('utf-8-sig')
            io_string = io.StringIO(decoded_file)
            reader = csv.DictReader(io_string)
            
            if 'code' not in reader.fieldnames or 'description_th' not in reader.fieldnames:
                return Response({"error": "ไฟล์ CSV ต้องมีคอลัมน์ 'code' และ 'description_th'"}, status=status.HTTP_400_BAD_REQUEST)
            
            icd_objects = []
            for row in reader:
                code = row.get('code', '').strip()
                desc = row.get('description_th', '').strip()
                if code:
                    icd_objects.append(ICD10(code=code, description_th=desc))
            
            ICD10.objects.bulk_create(icd_objects, ignore_conflicts=True)
            
            return Response({
                "message": f"นำเข้าข้อมูล ICD-10 สำเร็จ อ่านข้อมูลได้ {len(icd_objects)} รายการ (ระบบได้ทำการข้ามรหัสที่ซ้ำกันเรียบร้อยแล้ว)"
            }, status=status.HTTP_200_OK)
        
        except UnicodeDecodeError:
            return Response({"error": "พบปัญหาการอ่านภาษาไทย กรุณาเซฟไฟล์ CSV เป็นรูปแบบ UTF-8"}, status=status.HTTP_400_BAD_REQUEST)
        
        except Exception as e:
            return Response({"error": f"เกิดข้อผิดพลาดในการประมวลผล: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)