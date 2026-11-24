from django.core.management.base import BaseCommand
from patients.models import *
from django.utils import timezone
import datetime

class Command(BaseCommand):
    help = "จำลองข้อมูลคนไข้"
    
    def handle(self, *args, **kwargs):
        self.stdout.write('กำลังสร้างข้อมูลผู้ป่วย...')

        patient1, _ = Patient.objects.get_or_create(
            defaults={
                'id_card': '1100000000001',
                'title': 'นาย', 
                'first_name': 'มานะ', 
                'last_name': 'อดทน', 
                'date_of_birth': datetime.date(1990, 5, 15),
                'sex': 'Male',
                'blood_group': 'O',
                'phone': '0811111111', 
                'address': '123 หมู่ 1',
                'district': 'เมืองนนทบุรี',
                'province': 'นนทบุรี',
                'zipcode': '11000',
                'chronic': '',
                'allergic': ''
            }
        )
        
        patient2, _ = Patient.objects.get_or_create(
            defaults={
                'id_card': '2200000000002',
                'title': 'นาง', 
                'first_name': 'มานี', 
                'last_name': 'มีชัย',
                'date_of_birth': datetime.date(1985, 8, 20),
                'sex': 'Female', 
                'blood_group': 'B',
                'phone': '0822222222',
                'address': '456 หมู่ 2 ซอยใจดี',
                'district': 'พุทธมณฑล',
                'province': 'นครปฐม',
                'zipcode': '73170',
                'chronic': 'โรคความดันโลหิตสูง',
                'allergic': 'Penicillin (เพนิซิลลิน)'
            }
        )
        
        patient3, _ = Patient.objects.get_or_create( 
            defaults={
                'id_card': '3300000000003',
                'title': 'ด.ช.', 
                'first_name': 'ปิติ', 
                'last_name': 'ขยัน', 
                'date_of_birth': datetime.date(2015, 2, 10),
                'sex': 'Male',
                'blood_group': 'AB',
                'phone': '0833333333',
                'address': '789 คอนโด A ชั้น 5',
                'district': 'บางซื่อ',
                'province': 'กรุงเทพมหานคร',
                'zipcode': '10800',
                'chronic': 'โรคหอบหืด (Asthma)',
                'allergic': ''
            }
        )

        self.stdout.write(self.style.SUCCESS('- สร้างข้อมูลผู้ป่วย (Patients) สำเร็จ'))