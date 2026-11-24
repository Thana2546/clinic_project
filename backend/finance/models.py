import uuid
from django.db import models

# Create your models here.
class Payment(models.Model):
    STATUS_CHOICES = [('unpaid', 'Unpaid'), ('paid', 'Paid'), ('cancelled', 'Cancelled')]
    METHOD_CHOICES = [('cash', 'Cash'), ('transfer', 'Transfer')]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    patient = models.ForeignKey('patients.Patient', on_delete=models.CASCADE)
    medical_record = models.OneToOneField('clinic.MedicalRecord', on_delete=models.CASCADE, related_name='payment')
    doctor_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    medicine_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    payment_status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='unpaid')
    payment_method = models.CharField(max_length=20, choices=METHOD_CHOICES, blank=True, null=True)
    paid_at = models.DateTimeField(blank=True, null=True)

class PaymentItem(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    payment = models.ForeignKey(Payment, on_delete=models.CASCADE, related_name='items')
    description = models.CharField(max_length=255)
    amount = models.DecimalField(max_digits=10, decimal_places=2)