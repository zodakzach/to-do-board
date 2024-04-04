import 'bootstrap/js/dist/dropdown';
import 'bootstrap/js/dist/modal';
import 'bootstrap/js/dist/collapse';
import $ from 'jquery';
import datepicker from 'js-datepicker'

// Initialize datepicker
$(function(){
    const picker = datepicker('#datepicker', {
        formatter: (input, date, instance) => {
          const value = date.toLocaleDateString()
          input.value = value // => '1/1/2099'
        }
      })
});