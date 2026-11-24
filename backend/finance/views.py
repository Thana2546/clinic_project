import datetime
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import *
from .serializers import *
from .services import generate_or_update_payment
from users.permissions import IsNurse, IsAdmin

# View สำหรับจัดการการชำระเงิน
class PaymentViewSet(viewsets.ModelViewSet):
    queryset = Payment.objects.all().order_by('-id')
    serializer_class = PaymentSerializer

    def get_permissions(self):
        if self.action in ['create', 'pay']:
            permission_classes = [IsNurse | IsAdmin]
        else:
            permission_classes = [IsAuthenticated]

        return [permission() for permission in permission_classes]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        medical_record = serializer.validated_data['medical_record']

        payment = generate_or_update_payment(medical_record)

        response_serializer = PaymentSerializer(payment)

        return Response(
            response_serializer.data,
            status=status.HTTP_201_CREATED
        )

    @action(detail=True, methods=['post'], url_path='pay')
    def pay(self, request, pk=None):
        payment = self.get_object()

        if payment.payment_status == 'paid':
            return Response(
                {"error": "บิลนี้ชำระเงินไปแล้ว"},
                status=status.HTTP_400_BAD_REQUEST
            )

        serializer = PayActionSerializer(data=request.data)

        if serializer.is_valid():
            payment.payment_status = 'paid'
            payment.payment_method = serializer.validated_data['payment_method']
            payment.paid_at = datetime.datetime.now()
            payment.save()

            queue = payment.medical_record.daily_queue

            if hasattr(payment.medical_record, 'prescription'):
                queue.status = 'waiting_medicine'
            else:
                queue.status = 'completed'

            queue.save()

            return Response(
                {"message": "ชำระเงินเรียบร้อยแล้ว"},
                status=status.HTTP_200_OK
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )