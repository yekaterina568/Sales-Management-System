from rest_framework.views import APIView 
from .models import Contact
from rest_framework.response import Response
from .serializers import ContactSerializer
from rest_framework import permissions

class ContactList(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        contacts = Contact.objects.filter(owner=request.user)
        ser = ContactSerializer(contacts, many=True)
        return Response(ser.data)
    
    def post(self, request):
        ser = ContactSerializer(data=request.data)
        if ser.is_valid():
            ser.save(owner=request.user)
            return Response(ser.data, status=201)
        return Response(ser.errors, status=400)

class ContactDetail(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self, pk, user):
        try:
            return Contact.objects.get(pk=pk, owner=user)
        except Contact.DoesNotExist:
            return None
    
    def put(self, request, pk):
        contact = self.get_object(pk, request.user)
        if not contact: return Response(status=404)
        ser = ContactSerializer(contact, data=request.data)
        if ser.is_valid():
            ser.save()
            return Response(ser.data)
        return Response(ser.errors, status=400)
        
    def delete(self, request, pk):
        contact = self.get_object(pk, request.user)
        if not contact: return Response(status=404)
        contact.delete()
        return Response(status=204)