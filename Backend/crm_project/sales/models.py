from django.db import models
from django.contrib.auth.models import User

class Contact(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    full_name = models.CharField(max_length=255)
    company = models.CharField(max_length=255)
    email = models.EmailField()
    phone = models.CharField(max_length=50)
    status = models.CharField(max_length=20, default='Active')
    last_activity = models.DateTimeField(auto_now=True)

class Deal(models.Model):
    STAGE_CHOICES = [('New', 'New'), ('In Progress', 'In Progress'), ('Negotiation', 'Negotiation'), ('Won', 'Won'), ('Lost', 'Lost')]
    SOURCE_CHOICES = [('Manual', 'Manual'), ('Telegram', 'Telegram'), ('Web', 'Web'), ('Other', 'Other')]
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    title = models.CharField(max_length=255)
    value = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    stage = models.CharField(max_length=20, choices=STAGE_CHOICES, default='New')
    source = models.CharField(max_length=20, choices=SOURCE_CHOICES, default='Manual')
    contact = models.ForeignKey(Contact, on_delete=models.SET_NULL, null=True, blank=True, related_name='deals')
    expected_close = models.DateField()
    created_at = models.DateTimeField(auto_now_add=True, null=True)

class Note(models.Model):
    deal = models.ForeignKey(Deal, on_delete=models.CASCADE, related_name='notes')
    text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    author = models.ForeignKey(User, on_delete=models.CASCADE)

class ActivityTimeline(models.Model):
    deal = models.ForeignKey(Deal, on_delete=models.CASCADE, related_name='activities')
    action = models.CharField(max_length=255)
    timestamp = models.DateTimeField(auto_now_add=True)

class Task(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    title = models.CharField(max_length=255)
    deadline = models.DateField()
    completed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    role = models.CharField(max_length=100, default='Sales Manager')
    avatar_url = models.URLField(blank=True)
    bio = models.TextField(blank=True)
    phone = models.CharField(max_length=50, blank=True)
    company = models.CharField(max_length=255, blank=True)

class CollaborationRequest(models.Model):
    STATUS = [('pending', 'Pending'), ('accepted', 'Accepted'), ('declined', 'Declined')]
    from_user = models.ForeignKey(User, related_name='sent_requests', on_delete=models.CASCADE)
    to_user = models.ForeignKey(User, related_name='received_requests', on_delete=models.CASCADE)
    message = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=STATUS, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('from_user', 'to_user')

    def __str__(self):
        return f'{self.from_user} → {self.to_user} ({self.status})'