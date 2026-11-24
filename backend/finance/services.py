from django.db import transaction
from .models import Payment, PaymentItem
from clinic.models import MedicalRecord

@transaction.atomic
def generate_or_update_payment(medical_record):
    payment, created = Payment.objects.get_or_create(
        medical_record=medical_record,
        defaults={'patient': medical_record.patient}
    )
    
    if payment.payment_status == 'paid':
        return payment
    
    payment.items.all().delete()
    
    total = 0
    
    doctor_fee = medical_record.doctor_fee
    
    if doctor_fee > 0:
        PaymentItem.objects.create(payment=payment, description="Doctor Fee", amount=doctor_fee)
        total += doctor_fee
        payment.doctor_fee = doctor_fee
    
    medicine_fee = 0
    
    if hasattr(medical_record, 'prescription'):
        for item in medical_record.prescription.items.all():
            item_cost = item.quantity * item.medicine.selling_price 
            PaymentItem.objects.create(
                payment=payment,
                description=f"{item.medicine.drug_name} (x{item.quantity})",
                amount=item_cost
            )
            medicine_fee += item_cost
            
    payment.medicine_fee = medicine_fee
    total += medicine_fee
    payment.total_amount = total
    payment.save()
    
    return payment