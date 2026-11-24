from datetime import date
from rest_framework import serializers
from .models import *

class MedicineSerializer(serializers.ModelSerializer):
    active_stock = serializers.SerializerMethodField()
    
    class Meta:
        model = Medicine
        fields = '__all__'
    
    def get_active_stock(self, obj):
        today = date.today()
        valid_batches = obj.batches.filter(expiry_date__gt=today, quantity__gt=0)
        return sum(batch.quantity for batch in valid_batches)

class MedicineBatchSerializer(serializers.ModelSerializer):
    medicine_name = serializers.CharField(source='medicine.drug_name', read_only=True)

    class Meta:
        model = MedicineBatch
        fields = '__all__'
        read_only_fields = ['id', 'received_date']
        
    def validate_expiry_date(self, value):
        today = date.today()
        if value <= today:
            raise serializers.ValidationError("วันหมดอายุไม่ถูกต้อง")
        return value
    
    def validate_quantity(self, value):
        today = date.today()
        if value <= 0:
            raise serializers.ValidationError("จำนวนยาที่รับเข้าต้องมากกว่า 0")
        return value
    
    def validate_cost_price(self, value):
        if value < 0:
            raise serializers.ValidationError("ราคาต้นทุนต้องมากกว่า 0")
        return value

class PrescriptionItemSerializer(serializers.ModelSerializer):
    medicine_name = serializers.CharField(source='medicine.drug_name', read_only=True)
    quantity = serializers.IntegerField(
        min_value=1, 
        error_messages={
            'min_value': 'จำนวนยาต้องมากกว่า 0',
            'invalid': 'จำนวนยาต้องเป็นตัวเลขจำนวนเต็ม'
        })
    unit = serializers.CharField(source='medicine.unit', read_only=True)
    
    class Meta:
        model = PrescriptionItem
        fields = ['id', 'medicine', 'medicine_name', 'quantity', 'dosage', 'frequency', 'duration', 'instruction', 'unit']
        read_only_fields = ['id']

class PrescriptionSerializer(serializers.ModelSerializer):
    items = PrescriptionItemSerializer(many=True)
    doctor_name = serializers.SerializerMethodField()

    class Meta:
        model = Prescription
        fields = ['id', 'patient', 'doctor', 'doctor_name', 'medical_record', 'status', 'created_at', 'items']
        read_only_fields = ['id', 'doctor', 'status', 'created_at']

    def create(self, validated_data):
        items_data = validated_data.pop('items', [])
        
        prescription = Prescription.objects.create(**validated_data)
        
        for item_data in items_data:
            PrescriptionItem.objects.create(prescription=prescription, **item_data)
            
        return prescription

    def get_doctor_name(self, obj):
        return f"{obj.doctor.first_name} {obj.doctor.last_name}"