import os
from django.core.management.base import BaseCommand, CommandError


class Command(BaseCommand):
    help = 'Run Telegram lead capture bot'

    def add_arguments(self, parser):
        parser.add_argument('--token', type=str, help='Telegram bot token (or set TELEGRAM_BOT_TOKEN env var)')

    def handle(self, *args, **options):
        token = options.get('token') or os.environ.get('TELEGRAM_BOT_TOKEN')
        if not token:
            raise CommandError(
                'Bot token not provided.\n'
                'Use: python manage.py run_bot --token YOUR_TOKEN\n'
                'Or set environment variable: TELEGRAM_BOT_TOKEN=YOUR_TOKEN'
            )

        self.stdout.write(self.style.SUCCESS('Starting Telegram bot...'))
        from crm_project.sales.telegram_bot import run_bot
        run_bot(token)
