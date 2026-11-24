from rest_framework import serializers
from .models import Patient
from .services import generate_hn_number

class PatientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Patient
        fields = '__all__'
        read_only_fields = ['id', 'hn_number', 'created_at', 'updated_at']
    
    def create(self, validated_data):
        validated_data['hn_number'] = generate_hn_number()
        return super().create(validated_data)