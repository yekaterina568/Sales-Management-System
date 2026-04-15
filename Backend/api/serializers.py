from rest_framework import serializers
from .models import Contact, Deal 

class ContactSerializer(serializers.ModelSerializer):
    class Meta:
        model = Contact
        fields = ['id', 'name', 'email', 'owner']
        read_only_fields = ['owner']

class DealSerializer(serializers.ModelSerializer):
    class Meta:
        model = Deal
        fields = '__all__'
        read_only_fields = ['owner']

class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)

class DashBoardStatsSerializer(serializers.Serializer):
    total_contacts = serializers.IntegerField()
    total_deals = serializers.IntegerField()
    revenue = serializers.FloatField()