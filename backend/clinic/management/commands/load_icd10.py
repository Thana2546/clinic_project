import csv
import os
from django.core.management.base import BaseCommand
from clinic.models import *

class Command(BaseCommand):
    help = 'นำเข้าข้อมูล ICD-10 จากไฟล์ CSV'
    
    def handle(self, *args, **kwargs):
        csv_file_path = os.path.join(os.getcwd(), 'ICD_10_TM.csv')
        
        if not os.path.exists(csv_file_path):
            self.stdout.write(self.style.ERROR(f'ไม่พบไฟล์: {csv_file_path}'))
            return
    
        self.stdout.write('กำลังนำเข้าข้อมูล ICD-10...')
        
        icd_objects = []
        with open(csv_file_path, mode='r', encoding='utf-8') as file:
            reader = csv.DictReader(file)
            for row in reader:
                icd_objects.append(
                    ICD10(
                        code=row['code'].strip(),
                        description_th=row['description_th'].strip()
                    )
                )
        
        ICD10.objects.bulk_create(icd_objects, ignore_conflicts=True)
        self.stdout.write(self.style.SUCCESS(f'นำเข้าข้อมูลสำเร็จจำนวน {len(icd_objects)} รายการ!'))