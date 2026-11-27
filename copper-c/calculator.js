(function () {
  'use strict';
  var amount = document.getElementById('amount');
  var terms = Array.from(document.querySelectorAll('[data-term]'));
  var purposes = Array.from(document.querySelectorAll('.purposes button'));
  var selectedTerm = 60;
  var rates = {24:.035,36:.03,60:.025,84:.02,120:.015,144:.015,180:.015,240:.015,300:.015,360:.015};
  var bands = [
    {end:200000,value:'10萬-20萬',mid:150000},
    {end:300000,value:'20萬-30萬',mid:250000},
    {end:500000,value:'30萬-50萬',mid:400000},
    {end:1000000,value:'50萬-100萬',mid:750000}
  ];
  var trackingKeys = ['utm_source','utm_medium','utm_campaign','utm_content','utm_term','source','fbclid','ttclid',
    'campaign_id','adset_id','ad_id','ad_name','placement','site_source_name'];
  var incoming = new URLSearchParams(location.search);
  var legacyKey = 'd_project_c_selected_amount';
  var preciseKey = 'd_project_c_copper_calc_amount';

  function load(key) {
    try { return sessionStorage.getItem(key) || ''; } catch (_) { return ''; }
  }
  function save(key,value) {
    try { sessionStorage.setItem(key,value); } catch (_) { /* URL is sufficient. */ }
  }
  function bandFor(value) { return bands.find(function (band) { return value <= band.end; }) || bands[3]; }
  function money(value) { return 'NT$ ' + Math.max(0,Math.round(value)).toLocaleString('zh-TW'); }
  var fromLink = bands.find(function (band) { return band.value === incoming.get('amount'); });
  var savedBand = bands.find(function (band) { return band.value === load(legacyKey); });
  var precise = Number(load(preciseKey));
  var validPrecise = Number.isInteger(precise) && precise >= 100000 && precise <= 1000000 && precise % 50000 === 0;
  if (fromLink) amount.value = fromLink.mid;
  else if (validPrecise && (!savedBand || bandFor(precise) === savedBand)) amount.value = precise;
  else if (savedBand) amount.value = savedBand.mid;

  function render() {
    var principal = Number(amount.value);
    var rate = rates[selectedTerm];
    var monthlyRate = rate / 12;
    var payment = principal * monthlyRate / (1 - Math.pow(1 + monthlyRate,-selectedTerm));
    document.getElementById('amount-value').textContent = money(principal);
    document.getElementById('payment').textContent = money(payment);
    document.getElementById('rate').textContent = (rate * 100).toFixed(1) + '%';
    document.getElementById('total').textContent = money(payment * selectedTerm);
    document.getElementById('interest').textContent = money(payment * selectedTerm - principal);
  }
  amount.addEventListener('input',render);
  terms.forEach(function (button) {
    var term = Number(button.dataset.term);
    button.setAttribute('aria-pressed',String(term === selectedTerm));
    button.addEventListener('click',function () {
      selectedTerm = term;
      terms.forEach(function (item) {
        item.classList.toggle('selected',item === button);
        item.setAttribute('aria-pressed',String(item === button));
      });
      render();
    });
  });
  purposes.forEach(function (button) {
    button.setAttribute('aria-pressed',String(button.classList.contains('selected')));
    button.addEventListener('click',function () {
      purposes.forEach(function (item) {
        item.classList.toggle('selected',item === button);
        item.setAttribute('aria-pressed',String(item === button));
      });
    });
  });
  document.getElementById('apply').addEventListener('click',function () {
    var band = bandFor(Number(amount.value));
    save(preciseKey,amount.value);
    save(legacyKey,band.value);
    var target = new URL('apply.html',location.href);
    trackingKeys.forEach(function (key) {
      var value = incoming.get(key);
      if (value) target.searchParams.set(key,value);
    });
    target.searchParams.set('amount',band.value);
    target.searchParams.set('v','2026072703');
    location.assign(target.href);
  });
  render();
}());
