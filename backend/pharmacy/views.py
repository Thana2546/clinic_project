from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated
from django.db import transaction
from .models import *
from .serializers import *
from users.permissions import IsAdmin, IsDoctor, IsNurse
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError
from datetime import date, timedelta


# View สำหรับจัดการข้อมูลยา
class MedicineViewSet(viewsets.ModelViewSet):
    queryset = Medicine.objects.filter(status=True).order_by('drug_name')
    serializer_class = MedicineSerializer

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            permission_classes = [IsAdmin]
        else:
            permission_classes = [IsAuthenticated]

        return [permission() for permission in permission_classes]

    def get_queryset(self):
        if self.request.user.is_admin():
            return Medicine.objects.all().order_by('drug_name')

        return Medicine.objects.filter(status=True).order_by('drug_name')

# View สำหรับจัดการล็อตยา
class MedicineBatchViewSet(viewsets.ModelViewSet):
    queryset = MedicineBatch.objects.all().order_by('expiry_date')
    serializer_class = MedicineBatchSerializer

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            permission_classes = [IsAdmin]
        else:
            permission_classes = [IsAuthenticated]

        return [permission() for permission in permission_classes]

    def get_queryset(self):
        queryset = MedicineBatch.objects.all().order_by('expiry_date')
        medicine_id = self.request.query_params.get('medicine', None)

        if medicine_id is not None:
            queryset = queryset.filter(medicine_id=medicine_id)

        return queryset

# View สำหรับจัดการใบสั่งยา
class PrescriptionViewSet(viewsets.ModelViewSet):
    queryset = Prescription.objects.all().order_by('-created_at')
    serializer_class = PrescriptionSerializer

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            permission_classes = [IsDoctor]
        else:
            permission_classes = [IsAuthenticated]

        return [permission() for permission in permission_classes]

    @transaction.atomic
    def perform_create(self, serializer):
        serializer.save(
            doctor=self.request.user,
            status='pending'
        )

    @action(detail=True, methods=['post'], url_path='dispense')
    @transaction.atomic
    def dispense(self, request, pk=None):
        if not (request.user.is_nurse() or request.user.is_admin()):
            return Response(
                {"error": "เฉพาะพยาบาลหรือผู้ดูแลระบบเท่านั้นที่สามารถจ่ายยาได้"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        today = date.today()
        expiry_cutoff = today + timedelta(days=365)
        prescription = self.get_object()

        if prescription.status == 'dispensed':
            return Response(
                {"error": "ใบสั่งยานี้ถูกจ่ายไปแล้ว"},
                status=status.HTTP_400_BAD_REQUEST
            )

        for item in prescription.items.all():
            needed_qty = item.quantity
            batches = MedicineBatch.objects.filter(
                medicine=item.medicine,
                quantity__gt=0,
                expiry_date__gt=expiry_cutoff
            ).order_by('expiry_date')

            total_stock = sum(batch.quantity for batch in batches)

            if total_stock < needed_qty:
                raise ValidationError({
                    "error": f"ยา {item.medicine.drug_name} มีสต๊อกที่ยังไม่หมดอายุไม่เพียงพอ ต้องการ {needed_qty} มีพร้อมจ่าย {total_stock}"
                })
                
            for batch in batches:
                if needed_qty <= 0:
                    break

                if batch.quantity >= needed_qty:
                    batch.quantity -= needed_qty
                    batch.save()
                    needed_qty = 0
                else:
                    needed_qty -= batch.quantity
                    batch.quantity = 0
                    batch.save()

        prescription.status = 'dispensed'
        prescription.save()

        return Response({
            "message": "จ่ายยาและอัปเดตสต็อกเรียบร้อยแล้ว"
        })