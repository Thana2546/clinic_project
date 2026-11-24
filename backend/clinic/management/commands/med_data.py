from django.core.management.base import BaseCommand
from pharmacy.models import *
from django.utils import timezone
import datetime

class Command(BaseCommand):
    help = 'สร้างข้อมูลจำลองสำหรับยา'
        
    def handle(self, *args, **kwargs):
        today = timezone.now().date()
        self.stdout.write('กำลังสร้างข้อมูลยาและสต๊อก...')

        med1, _ = Medicine.objects.get_or_create(
            drug_name='Sara 500mg', 
            defaults={
                'generic_name': 'Paracetamol 500mg',
                'category': 'ยาแก้ปวด/ลดไข้',
                'unit': 'แผง',
                'selling_price': 15.00,
                'reorder_level': 50,
                'status': True
            }
        )
        MedicineBatch.objects.get_or_create(
            medicine=med1, batch_number='LOT-2401', 
            defaults={
                'quantity': 200, 
                'expiry_date': today + datetime.timedelta(days=730), # อีก 2 ปีหมดอายุ
                'cost_price': 8.50
            }
        )

        med2, _ = Medicine.objects.get_or_create(
            drug_name='Amoxil 500mg', 
            defaults={
                'generic_name': 'Amoxicillin 500mg',
                'category': 'ยาปฏิชีวนะ',
                'unit': 'แผง',
                'selling_price': 45.00,
                'reorder_level': 30,
                'status': True
            }
        )

        MedicineBatch.objects.get_or_create(
            medicine=med2, batch_number='LOT-2311', 
            defaults={'quantity': 15, 'expiry_date': today + datetime.timedelta(days=180), 'cost_price': 25.00}
        )

        MedicineBatch.objects.get_or_create(
            medicine=med2, batch_number='LOT-2405', 
            defaults={'quantity': 100, 'expiry_date': today + datetime.timedelta(days=500), 'cost_price': 26.00}
        )

        med3, _ = Medicine.objects.get_or_create(
            drug_name='Chlorpheniramine 4mg', 
            defaults={
                'generic_name': 'Chlorpheniramine Maleate',
                'category': 'ยาแก้แพ้',
                'unit': 'แผง',
                'selling_price': 10.00,
                'reorder_level': 50,
                'status': True
            }
        )
        MedicineBatch.objects.get_or_create(
            medicine=med3, batch_number='LOT-2309', 
            defaults={
                'quantity': 10,
                'expiry_date': today + datetime.timedelta(days=300), 
                'cost_price': 4.00
            }
        )

        med4, _ = Medicine.objects.get_or_create(
            drug_name='Miracid 20mg', 
            defaults={
                'generic_name': 'Omeprazole 20mg',
                'category': 'ยาลดกรดในกระเพาะ',
                'unit': 'แคปซูล',
                'selling_price': 3.00,
                'reorder_level': 100,
                'status': True
            }
        )
        MedicineBatch.objects.get_or_create(
            medicine=med4, batch_number='LOT-2201', 
            defaults={
                'quantity': 150, 
                'expiry_date': today + datetime.timedelta(days=20),
                'cost_price': 1.50
            }
        )

        self.stdout.write(self.style.SUCCESS('- สร้างข้อมูลยาและสต๊อก (Medicines & Batches) สำเร็จ'))