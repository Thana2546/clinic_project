import datetime
from .models import Patient

def generate_hn_number():
    today = datetime.date.today()
    prefix = f"HN-{today.strftime('%y%m')}-"
    
    last_patient = Patient.objects.filter(hn_number__startswith=prefix).order_by('-hn_number').first()
    
    if last_patient:
        last_number = int(last_patient.hn_number.split('-')[-1])
        new_number = last_number + 1
    else:
        new_number = 1
    
    return f"{prefix}{new_number:04d}"