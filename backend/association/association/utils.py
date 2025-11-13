from datetime import date
import re


def calculate_age(born):
    today = date.today()
    return today.year - born.year - ((today.month, today.day) < (born.month, born.day))


def clean_excel_name(name: str, max_len: int = 31) -> str:
    # Remove forbidden Excel characters and invisible Unicode direction marks
    name = re.sub(r'[\x00-\x1f<>:"/\\|?*\[\]]', '', name)
    name = name.replace('\u202A', '').replace('\u202B', '').replace('\u200F', '')
    return name[:max_len]
