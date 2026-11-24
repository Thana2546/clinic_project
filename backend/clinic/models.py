import uuid
from django.db import models
from django.conf import settings

# Create your models here.
class Appointment(models.Model):
    STATUS_CHOICES = [
        ('scheduled', 'Scheduled'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
        ('no_show', 'No Show'),
    ]
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    patient = models.ForeignKey('patients.Patient', on_delete=models.CASCADE, related_name='appointments')
    doctor = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name='appointments')
    appointment_date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField()
    reason = models.TextField("หมายเหตุการนัด", blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='scheduled')

class DailyQueue(models.Model):
    QUEUE_TYPE = [('appointment', 'Appointment'), ('walk_in', 'Walk-in')]
    STATUS_CHOICES = [
        ('waiting', 'Waiting'),
        ('waiting_vitals', 'Waiting for Vitals'),
        ('waiting_doctor', 'Waiting for Doctor'),
        ('in_progress', 'In Progress'),
        ('waiting_payment', 'Waiting for Payment'),
        ('waiting_medicine', 'Waiting for Medicine'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    queue_number = models.CharField("หมายเลขคิว", max_length=10)
    patient = models.ForeignKey('patients.Patient', on_delete=models.CASCADE, related_name='queues')
    doctor = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    queue_date = models.DateField("วันออกคิว", auto_now_add=True)
    queue_type = models.CharField("ประเภทคิว", max_length=20, choices=QUEUE_TYPE)
    priority = models.IntegerField("ความสำคัญ", default=0)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='waiting')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

class Vital(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    patient = models.ForeignKey('patients.Patient', on_delete=models.CASCADE)
    daily_queue = models.OneToOneField(DailyQueue, on_delete=models.CASCADE, related_name='vitals')
    weight = models.DecimalField("น้ำหนัก", max_digits=5, decimal_places=2)
    height = models.DecimalField("ส่วนสูง", max_digits=5, decimal_places=2)
    systolic_bp = models.IntegerField()
    diastolic_bp = models.IntegerField()
    temperature = models.DecimalField("อุณหภูมิ", max_digits=4, decimal_places=1)
    symptoms = models.TextField("อาการ")
    recorded_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    recorded_at = models.DateTimeField(auto_now_add=True)
    
class MedicalRecord(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    patient = models.ForeignKey('patients.Patient', on_delete=models.CASCADE)
    doctor = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    daily_queue = models.OneToOneField(DailyQueue, on_delete=models.SET_NULL, null=True)
    chief_complaint = models.TextField()
    treatment = models.TextField()
    note = models.TextField(blank=True, null=True)
    doctor_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    created_at = models.DateTimeField(auto_now_add=True)

class Diagnosis(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    medical_record = models.ForeignKey(MedicalRecord, on_delete=models.CASCADE, related_name='diagnoses')
    icd10_code = models.CharField(max_length=20, blank=True, null=True)
    description = models.TextField()

class FollowUp(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    patient = models.ForeignKey('patients.Patient', on_delete=models.CASCADE)
    doctor = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    medical_record = models.ForeignKey(MedicalRecord, on_delete=models.CASCADE)
    follow_up_date = models.DateField()
    follow_up_time = models.TimeField(blank=True, null=True)
    note = models.TextField(blank=True, null=True)
    status = models.CharField(max_length=20, default='scheduled')

class ICD10(models.Model):
    code = models.CharField(max_length=20, unique=True, db_index=True)
    description_th = models.TextField(null=True, blank=True)
    
    def __str__(self):
        return f"{self.code} - {self.description_th}"