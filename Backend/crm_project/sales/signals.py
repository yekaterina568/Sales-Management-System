from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver
from django.contrib.auth.models import User
from .models import UserProfile, Deal, ActivityTimeline


@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        UserProfile.objects.get_or_create(user=instance)


@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    if hasattr(instance, 'profile'):
        instance.profile.save()


@receiver(pre_save, sender=Deal)
def log_stage_change(sender, instance, **kwargs):
    if not instance.pk:
        return
    try:
        old = Deal.objects.get(pk=instance.pk)
        if old.stage != instance.stage:
            ActivityTimeline.objects.create(
                deal=instance,
                action=f'Stage changed: {old.stage} → {instance.stage}'
            )
    except Deal.DoesNotExist:
        pass


@receiver(post_save, sender=Deal)
def log_deal_created(sender, instance, created, **kwargs):
    if created:
        source_label = f' (via {instance.source})' if instance.source != 'Manual' else ''
        ActivityTimeline.objects.create(
            deal=instance,
            action=f'Deal created{source_label}'
        )