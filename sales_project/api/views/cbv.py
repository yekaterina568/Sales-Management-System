from rest_framework.views import APIView, Response
from rest_framework.permissions import IsAuthenticated
from api.models import Customer
from api.serializers import CustomerSerializer

class CustomerList(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        customers = Customer.objects.filter(created_by=request.user)
        serializer = CustomerSerializer(customers, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = CustomerSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(created_by=request.user)
            return Response(serializer.data)
        return Response(serializer.errors)