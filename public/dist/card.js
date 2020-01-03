const stripe = Stripe('pk_test_kDYq9twVedQozpbUvTyLLsUk00ew0W7UrF'); 
//const stripe = Stripe('pk_test_swNqPiBxZhZMRbTa13BNPB3500XgQp9Qn4'); 
const elements = stripe.elements();

var style = {
  base: {
    color: "#000"
  }
};

const card = elements.create('card', { style });
card.mount('#card-element');

const form = document.querySelector('#form');
const errorEl = document.querySelector('#card-errors');

const stripeTokenHandler = token => {
  const hiddenInput = document.createElement('input');
  hiddenInput.setAttribute('type', 'hidden');
  hiddenInput.setAttribute('name', 'source');
  hiddenInput.setAttribute('value', token.id);
  form.appendChild(hiddenInput);
  if (document.getElementsByName("cardnumber")[0]) {
  const hiddenCardNo = document.createElement('input');
  hiddenCardNo.setAttribute('type', 'hidden');
  hiddenCardNo.setAttribute('name', 'card_no');
  hiddenCardNo.setAttribute('value', document.getElementsByName("cardnumber")[0].value);
  form.appendChild(hiddenCardNo);
  }
	console.log(form);
  form.submit();
}

form.addEventListener('submit', e => {
  e.preventDefault();

  stripe.createToken(card).then(res => {
    if (res.error) errorEl.textContent = res.error.message;
    else stripeTokenHandler(res.token);
  })
})