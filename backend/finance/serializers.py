from rest_framework import serializers
from .models import *
from clinic.models import MedicalRecord

class PaymentItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = PaymentItem
        fields = ['id', 'description', 'amount']
        read_only_fields = ['id', 'description', 'amount']

class PaymentSerializer(serializers.ModelSerializer):
    items = PaymentItemSerializer(many=True, read_only=True)
    patient_name = serializers.CharField(source='patient.first_name', read_only=True)
    
    medical_record_id = serializers.PrimaryKeyRelatedField(
        queryset=MedicalRecord.objects.all(), 
        source='medical_record',
        write_only=True
    )
    
    class Meta:
        model = Payment
        fields = [
            'id', 'patient', 'patient_name', 'medical_record_id', 'medical_record',
            'doctor_fee', 'medicine_fee', 'total_amount', 
            'payment_status', 'payment_method', 'paid_at', 'items'
        ]
        read_only_fields = [
            'id', 'patient', 'medical_record', 'doctor_fee', 'medicine_fee', 
            'total_amount', 'payment_status', 'paid_at'
        ]

class PayActionSerializer(serializers.Serializer):
    payment_method = serializers.ChoiceField(choices=Payment.METHOD_CHOICES)