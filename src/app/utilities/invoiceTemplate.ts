import { TOrder } from "../modules/order/order.interface";
import { TUser } from "../modules/user/user.interface";

export const generateInvoiceHTML = (order: TOrder, customer: TUser) => {

  const { foods, totalPrice, tax, grandAmount, transactionId } = order;

  const currency = "$";

  // Your logo
  const logo = "https://i.postimg.cc/gjhSbS06/resturent.png";

  const date = new Date(order?.createdAt || Date.now()).toLocaleDateString();

  const fullAddress = customer?.address
    ? `${customer.address.street}, ${customer.address.city}${customer.address.state ? `, ${customer.address.state}` : ""}, ${customer.address.postalCode}, ${customer.address.country}`
    : "Address not provided";


  const foodItems = foods
    .map(
      (item: any, index: number) => `
<tr>

<td style="text-align:center">${index + 1}</td>

<td style="text-align:center">
<img src="${item.food.image}" 
style="width:50px;height:50px;border-radius:6px;object-fit:cover;" />
</td>

<td>
<strong>${item.food.name}</strong>
<div style="font-size:12px;color:#666">
${item.food.description || ""}
</div>
</td>

<td style="text-align:center">
${item.quantity}
</td>

<td style="text-align:right">
${currency}${item.food.price.toFixed(2)}
</td>

<td style="text-align:right;font-weight:600">
${currency}${(item.food.price * item.quantity).toFixed(2)}
</td>

</tr>
`
    )
    .join("");


  return `
<!DOCTYPE html>
<html>

<head>

<meta charset="UTF-8">

<title>Invoice</title>

<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet">

<style>

body{
font-family:'Inter',sans-serif;
padding:40px;
color:#2d3748;
background:#fff;
}

.header{
display:flex;
justify-content:space-between;
align-items:center;
margin-bottom:40px;
}

.logo-area{
display:flex;
align-items:center;
gap:15px;
}

.logo-area img{
width:80px;
height:80px;
object-fit:contain;
}

.company-name{
font-size:22px;
font-weight:700;
}

.company-address{
font-size:13px;
color:#718096;
}

.invoice-title{
font-size:40px;
font-weight:700;
color:#2563eb;
}

.info-grid{
display:flex;
justify-content:space-between;
margin-bottom:40px;
}

.info-box{
width:30%;
}

.label{
font-size:13px;
font-weight:600;
color:#718096;
margin-bottom:6px;
}

.value{
font-size:14px;
}

table{
width:100%;
border-collapse:collapse;
}

th{
text-align:left;
border-bottom:2px solid #e2e8f0;
padding:10px 0;
font-size:14px;
}

td{
border-bottom:1px solid #edf2f7;
padding:12px 0;
font-size:14px;
}

.totals{
margin-top:30px;
display:flex;
justify-content:flex-end;
}

.totals-box{
width:260px;
}

.total-row{
display:flex;
justify-content:space-between;
margin-bottom:6px;
}

.grand{
font-size:20px;
font-weight:700;
border-top:2px solid #e2e8f0;
padding-top:10px;
}

.footer{
margin-top:80px;
display:flex;
justify-content:space-between;
}

.thank{
font-size:28px;
font-weight:600;
color:#2563eb;
}

</style>

</head>

<body>


<div class="header">

<div class="logo-area">

<img src="${logo}" />

<div>

<div class="company-name">
SnackZilla
</div>

<div class="company-address">
House 2, Road 3, Sector 6 <br>
Uttara, Dhaka
</div>

</div>

</div>

<div class="invoice-title">
INVOICE
</div>

</div>


<div class="info-grid">

<div class="info-box">

<div class="label">
Bill To
</div>

<div class="value">
<strong>${customer?.name}</strong><br>
${fullAddress}<br>
${customer?.phone}
</div>

</div>


<div class="info-box">

<div class="label">
Invoice ID
</div>

<div class="value">
${transactionId}
</div>

<div class="label" style="margin-top:12px">
Invoice Date
</div>

<div class="value">
${date}
</div>

</div>


<div class="info-box">

<div class="label">
P.O Number
</div>

<div class="value">
${order?.po || "N/A"}
</div>

<div class="label" style="margin-top:12px">
Due Date
</div>

<div class="value">
${order?.dueDate || "N/A"}
</div>

</div>

</div>



<table>

<thead>

<tr>

<th>#</th>
<th>Image</th>
<th>Item</th>
<th style="text-align:center">Qty</th>
<th style="text-align:right">Unit Price</th>
<th style="text-align:right">Amount</th>

</tr>

</thead>

<tbody>

${foodItems}

</tbody>

</table>



<div class="totals">

<div class="totals-box">

<div class="total-row">
<span>Subtotal</span>
<span>${currency}${totalPrice.toFixed(2)}</span>
</div>

<div class="total-row">
<span>Tax</span>
<span>${currency}${tax.toFixed(2)}</span>
</div>

<div class="total-row grand">
<span>Total</span>
<span>${currency}${grandAmount.toFixed(2)}</span>
</div>

</div>

</div>



<div class="footer">

<div class="thank">
Thank you for your order!
</div>

<div style="font-size:12px;color:#718096">
Payment due within 15 days
</div>

</div>


</body>
</html>
`;
};