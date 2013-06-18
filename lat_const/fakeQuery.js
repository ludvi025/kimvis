var fake_result = [];
for (var i = 0; i<30; i++){
	fake_result.push(["Adam's Awesome Test" + gR(10000,99999).toString(), "Adam's Awesome Model", gR(0,500).toString(), "K", "Al", "fcc", gR(1,10).toString(), "4.123", "4.123", "90", "90", "90", "Fm-3m"]);
	fake_result.push(["Michl's Awesome Test"+ gR(10000,99999).toString(), "Michl's Awesome Model", gR(0,500).toString(), "K", "Mg", "bcc", gR(1,10).toString(), "3.124", "3.124", "90", "90", "90", "Im-3m"]);
	fake_result.push(["Hanlin's Awesome Test"+ gR(10000,99999).toString(), "Hanlin's Awesome Model", gR(0,500).toString(), "K", "C", "sc", gR(1,10).toString(), "2.124", "2.124", "90", "90", "90", "Pm-3m"]);	
}
function gR(min, max) {
  return Math.random() * (max - min) + min;
}