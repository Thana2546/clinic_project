from datetime import date, timedelta
from rest_framework.views import APIView
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from users.permissions import IsAdmin, IsNurse, IsDoctor
from patients.models import Patient
from clinic.models import DailyQueue
from pharmacy.models import Medicine, MedicineBatch
from finance.models import Payment

User = get_user_model()

# Dashboard สำหรับ Admin
class AdminDashboardView(APIView):
    permission_classes = [IsAdmin]

    def get(self, request):
        today = date.today()
        total_patients = Patient.objects.count()
        total_doctors = User.objects.filter(role='doctor', is_active=True).count()
        total_nurses = User.objects.filter(role='nurse', is_active=True).count()
        today_visits = DailyQueue.objects.filter(queue_date=today).count()
        today_payments = Payment.objects.filter(payment_status='paid', paid_at__date=today)
        today_revenue = sum(payment.total_amount for payment in today_payments)

        low_stock_list = []

        active_medicines = Medicine.objects.filter(status=True)

        for medicine in active_medicines:
            total_stock = sum(
                batch.quantity 
                for batch in medicine.batches.filter(
                    quantity__gt=0,
                    expiry_date__gt=today
                )
            )

            if total_stock <= medicine.reorder_level:
                low_stock_list.append({
                    "id": str(medicine.id),
                    "drug_name": medicine.drug_name,
                    "total_stock": total_stock,
                    "reorder_level": medicine.reorder_level
                })

        thirty_days_later = today + timedelta(days=30)

        expiring_batches = MedicineBatch.objects.filter(
            quantity__gt=0, 
            expiry_date__gte=today,
            expiry_date__lte=thirty_days_later
        ).order_by('expiry_date')

        expiring_list = []

        for batch in expiring_batches:
            expiring_list.append({
                "batch_number": batch.batch_number,
                "medicine_name": batch.medicine.drug_name,
                "quantity": batch.quantity,
                "expiry_date": str(batch.expiry_date)
            })

        return Response({
            "total_patients": total_patients,
            "total_doctors": total_doctors,
            "total_nurses": total_nurses,
            "today_visits": today_visits,
            "today_revenue": today_revenue,
            "low_stock_medicines": low_stock_list,
            "expiring_medicines": expiring_list
        })

# Dashboard สำหรับ Nurse
class NurseDashboardView(APIView):
    permission_classes = [IsNurse]

    def get(self, request):
        today = date.today()
        today_queues = DailyQueue.objects.filter(queue_date=today)
        total_patients = today_queues.count()
        waiting_vitals = today_queues.filter(status='waiting_vitals').count()
        waiting_doctor = today_queues.filter(status='waiting_doctor').count()
        waiting_payment = today_queues.filter(status='waiting_payment').count()
        waiting_medicine = today_queues.filter(status='waiting_medicine').count()
        completed = today_queues.filter(status='completed').count()

        return Response({
            "total_patients_today": total_patients,
            "waiting_for_vitals": waiting_vitals,
            "waiting_for_doctor": waiting_doctor,
            "waiting_for_payment": waiting_payment,
            "waiting_for_medicine": waiting_medicine,
            "completed": completed
        })

# Dashboard สำหรับ Doctor
class DoctorDashboardView(APIView):
    permission_classes = [IsDoctor]

    def get(self, request):
        today = date.today()
        doctor = request.user
        
        my_today_queues = DailyQueue.objects.filter(queue_date=today, doctor=doctor)
        
        waiting_patients = my_today_queues.filter(status='waiting_doctor').count()
        current_queue = my_today_queues.filter(status='in_progress').first()

        current_patient_data = None

        if current_queue:
            patient = current_queue.patient

            current_patient_data = {
                "queue_number": current_queue.queue_number,
                "patient_name": f"{patient.first_name} {patient.last_name}",
                "hn_number": patient.hn_number
            }

        completed_today = my_today_queues.filter(
            status__in=[
                'waiting_payment',
                'waiting_medicine',
                'completed'
            ],
            doctor=doctor
        ).count()

        return Response({
            "waiting_patients": waiting_patients,
            "current_patient": current_patient_data,
            "completed_today": completed_today,
            "total_queue_today": my_today_queues.count()
        })