import os
import logging
from datetime import date, timedelta

import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'crm_project.settings')
django.setup()

from django.contrib.auth.models import User
from django.db import close_old_connections
from crm_project.sales.models import Contact, Deal
from asgiref.sync import sync_to_async

from telegram import Update, ReplyKeyboardRemove
from telegram.ext import (
    Application, CommandHandler, MessageHandler,
    ConversationHandler, filters, ContextTypes
)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

NAME, PHONE, REQUEST = range(3)

WELCOME_TEXT = (
    "👋 Привет! Вы обратились в нашу компанию.\n\n"
    "Я помогу оставить заявку — это займёт меньше минуты.\n\n"
    "Как вас зовут?"
)


async def start(update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
    await update.message.reply_text(WELCOME_TEXT, reply_markup=ReplyKeyboardRemove())
    return NAME


async def get_name(update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
    context.user_data['name'] = update.message.text.strip()
    await update.message.reply_text(f"Приятно познакомиться, {context.user_data['name']}! 👍\n\nУкажите ваш номер телефона:")
    return PHONE


async def get_phone(update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
    context.user_data['phone'] = update.message.text.strip()
    await update.message.reply_text("Отлично! Расскажите кратко — чем мы можем вам помочь?")
    return REQUEST


def _create_lead(name: str, phone: str, message: str):
    manager = User.objects.filter(is_superuser=True).first() or User.objects.first()
    if not manager:
        return False
    contact, _ = Contact.objects.get_or_create(
        phone=phone,
        defaults={
            'user': manager,
            'full_name': name,
            'email': '',
            'company': '',
            'status': 'Active',
        }
    )
    if not contact.full_name:
        contact.full_name = name
        contact.save()
    Deal.objects.create(
        user=manager,
        title=f"Заявка: {message[:60]}",
        value=0,
        stage='New',
        source='Telegram',
        contact=contact,
        expected_close=date.today() + timedelta(days=14),
    )
    logger.info(f"New lead from Telegram: {name} / {phone}")
    return True


async def get_request(update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
    name = context.user_data['name']
    phone = context.user_data['phone']
    message = update.message.text.strip()

    await sync_to_async(_create_lead)(name, phone, message)

    await update.message.reply_text(
        "✅ Ваша заявка принята!\n\n"
        "Наш менеджер свяжется с вами в ближайшее время. 🙌\n\n"
        "Если хотите оставить ещё одну заявку — напишите /start"
    )
    return ConversationHandler.END


async def cancel(update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
    await update.message.reply_text("Отменено. Введите /start чтобы начать снова.")
    return ConversationHandler.END


def run_bot(token: str):
    app = Application.builder().token(token).build()

    conv = ConversationHandler(
        entry_points=[CommandHandler('start', start)],
        states={
            NAME: [MessageHandler(filters.TEXT & ~filters.COMMAND, get_name)],
            PHONE: [MessageHandler(filters.TEXT & ~filters.COMMAND, get_phone)],
            REQUEST: [MessageHandler(filters.TEXT & ~filters.COMMAND, get_request)],
        },
        fallbacks=[CommandHandler('cancel', cancel)],
    )

    app.add_handler(conv)
    logger.info("Telegram bot started. Waiting for messages...")
    app.run_polling(drop_pending_updates=True)
