from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import get_user_model
from .models import *

User = get_user_model()

# Serializer สำหรับข้อมูล Profile
class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'role', 'phone']

# Serializer สำหรับ Login และสร้าง Token
class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        token['username'] = user.username
        token['role'] = user.role

        return token

    def validate(self, attrs):
        data = super().validate(attrs)

        data['user'] = {
            'id': str(self.user.id),
            'username': self.user.username,
            'role': self.user.role,
            'first_name': self.user.first_name,
            'last_name': self.user.last_name
        }

        return data

# Serializer สำหรับจัดการ User
class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True,
        required=False,
        allow_blank=True,
        style={'input_type': 'password'}
    )

    license_number = serializers.CharField(
        required=False,
        allow_blank=True,
        allow_null=True
    )

    class Meta:
        model = User
        fields = [
            'id', 'title', 'username', 'email', 'password', 'first_name', 'last_name',
            'sex', 'address', 'moo', 'sub_district', 'district',
            'province', 'zipcode', 'phone', 'role', 'is_active',
            'date_joined', 'license_number'
        ]

        read_only_fields = ['id', 'date_joined']
    
    def validate_email(self, value):
        if not value:
            return value
            
        user_id = self.instance.id if self.instance else None
        
        if User.objects.filter(email=value).exclude(id=user_id).exists():
            raise serializers.ValidationError("อีเมลนี้ถูกลงทะเบียนไว้แล้วในระบบ")
            
        return value

    def to_representation(self, instance):
        data = super().to_representation(instance)

        if instance.role == 'doctor':
            if hasattr(instance, 'doctor_profile'):
                data['license_number'] = instance.doctor_profile.license_number

        elif instance.role == 'nurse':
            if hasattr(instance, 'nurse_profile'):
                data['license_number'] = instance.nurse_profile.license_number

        return data

    def create(self, validated_data):
        license_number = validated_data.pop('license_number', '')
        specialist = validated_data.pop('specialist_id', None)
        password = validated_data.pop('password')

        user = User(**validated_data)
        user.set_password(password)
        user.save()

        if user.role == 'doctor':
            DoctorProfile.objects.create(
                user=user,
                license_number=license_number,
                specialist=specialist
            )

        elif user.role == 'nurse':
            NurseProfile.objects.create(
                user=user,
                license_number=license_number
            )

        return user

    def update(self, instance, validated_data):
        license_number = validated_data.pop('license_number', None)
        specialist = validated_data.pop('specialist_id', None)
        password = validated_data.pop('password', None)

        for field, value in validated_data.items():
            setattr(instance, field, value)

        if password:
            instance.set_password(password)

        instance.save()

        if instance.role == 'doctor':
            profile, created = DoctorProfile.objects.get_or_create(user=instance)

            if license_number is not None:
                profile.license_number = license_number

            if specialist is not None:
                profile.specialist = specialist

            profile.save()

        elif instance.role == 'nurse':
            profile, created = NurseProfile.objects.get_or_create(user=instance)

            if license_number is not None:
                profile.license_number = license_number

            profile.save()

        return instance