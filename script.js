/* ============================================================
   JS: анимация появления, FAQ, формы, валидация, маска телефона
   ============================================================ */

// ---------- 1. Год в футере ----------
document.getElementById('year').textContent = new Date().getFullYear();

// ---------- 2. Плавное появление блоков (IntersectionObserver) ----------
(function initReveal() {
  const items = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    items.forEach(el => el.classList.add('visible'));
    return;
  }
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  items.forEach(el => io.observe(el));
})();

// ---------- 3. FAQ-аккордеон ----------
document.querySelectorAll('.faq-q').forEach(btn => {
  btn.addEventListener('click', () => {
    const item = btn.closest('.faq-item');
    const isOpen = btn.getAttribute('aria-expanded') === 'true';
    // закрыть остальные (один открыт — так меньше визуального шума)
    document.querySelectorAll('.faq-item.open').forEach(other => {
      if (other !== item) {
        other.classList.remove('open');
        other.querySelector('.faq-q').setAttribute('aria-expanded', 'false');
      }
    });
    btn.setAttribute('aria-expanded', String(!isOpen));
    item.classList.toggle('open', !isOpen);
  });
});

// ---------- 4. Маска телефона (простая, RU) ----------
function applyPhoneMask(input) {
  input.addEventListener('input', () => {
    let digits = input.value.replace(/\D/g, '');
    if (digits.startsWith('8')) digits = '7' + digits.slice(1);
    if (!digits.startsWith('7')) digits = '7' + digits;
    digits = digits.slice(0, 11);

    let out = '+7';
    if (digits.length > 1) out += ' (' + digits.slice(1, 4);
    if (digits.length >= 5) out += ') ' + digits.slice(4, 7);
    if (digits.length >= 8) out += '-' + digits.slice(7, 9);
    if (digits.length >= 10) out += '-' + digits.slice(9, 11);
    input.value = out;
  });
  // при фокусе, если пусто — подставить +7
  input.addEventListener('focus', () => {
    if (!input.value) input.value = '+7 (';
  });
}

    // ---------- 5. Валидация + отправка форм ----------
document.querySelectorAll('form[data-form]').forEach(form => {
  // маска для телефонных полей
  form.querySelectorAll('input[type="tel"]').forEach(applyPhoneMask);

  const setError = (field, msg) => {
    const wrap = field.closest('.field');
    const err = wrap.querySelector('[data-error]');
    if (err) { err.textContent = msg; err.classList.add('show'); }
    if (field.type === 'checkbox') {
      field.closest('.checkbox')?.classList.add('invalid');
    } else {
      field.classList.add('invalid');
    }
  };
  const clearError = (field) => {
    const wrap = field.closest('.field');
    const err = wrap.querySelector('[data-error]');
    if (err) { err.textContent = ''; err.classList.remove('show'); }
    field.classList.remove('invalid');
    field.closest('.checkbox')?.classList.remove('invalid');
  };

  form.querySelectorAll('input').forEach(inp => {
    inp.addEventListener('input', () => clearError(inp));
    inp.addEventListener('change', () => clearError(inp));
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    let ok = true;
    const data = {};

    form.querySelectorAll('input').forEach(inp => { clearError(inp); });

    // имя
    const name = form.querySelector('input[name="name"]');
    if (name) {
      const v = name.value.trim();
      if (v.length < 2) { setError(name, 'Введите имя (минимум 2 символа)'); ok = false; }
      else data.name = v;
    }

    // телефон
    const phone = form.querySelector('input[name="phone"]');
    if (phone) {
      const digits = phone.value.replace(/\D/g, '');
      if (digits.length !== 11) { setError(phone, 'Введите корректный номер телефона'); ok = false; }
      else data.phone = phone.value;
    }

    // email
    const email = form.querySelector('input[name="email"]');
    if (email) {
      const re = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
      if (!re.test(email.value.trim())) { setError(email, 'Введите корректный email'); ok = false; }
      else data.email = email.value.trim();
    }

        // согласие
    const consent = form.querySelector('input[name="consent"]');
    if (consent && !consent.checked) { setError(consent, 'Нужно согласие на обработку данных'); ok = false; }

    if (!ok) {
      // фокус на первое поле с ошибкой для доступности
      const firstInvalid = form.querySelector('.invalid, .checkbox.invalid');
      if (firstInvalid) firstInvalid.focus?.();
      return;
    }

    // ---------- Имитация отправки ----------
    // В продакшене заменить на реальный эндпоинт CRM / Telegram-бота:
    //   await fetch('https://your-crm.example/api/lead', {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify({ ...data, source: 'landing', tariff: '...' })
    //   });
    // Или отправить в Telegram через Bot API:
    //   await fetch(`https://api.telegram.org/bot<TOKEN>/sendMessage`, {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify({ chat_id: '<CHAT_ID>', text: JSON.stringify(data) })
    //   });
    console.log('Отправка заявки:', data);

    const success = form.querySelector('.form-success');
    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Отправляем…';
    await new Promise(r => setTimeout(r, 700)); // имитация сети
    success.classList.add('show');
    form.querySelectorAll('input').forEach(i => i.value = '');
    submitBtn.disabled = false;
    submitBtn.textContent = 'Отправить ещё раз';
    });
});