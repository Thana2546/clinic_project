import datetime
from .models import DailyQueue

def generate_queue_number(queue_type):
    today = datetime.date.today()
    queue_count = DailyQueue.objects.filter(
        queue_date=today,
        queue_type=queue_type
    ).count()
    
    new_number = queue_count + 1
    
    if queue_type == 'appointment':
        prefix = 'A'
    else:
        prefix = 'W'
    
    return f"{prefix}{new_number:03d}"