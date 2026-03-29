import PDFDocument from "pdfkit";
import axios from "axios";

export type TPopulatedOrder = {
  _id: string;
  user: { name: string; address: { street: string; city: string; state?: string; postalCode: string; country: string }; phone: string };
  foods: { food: { name: string; image: string; price: number }; quantity: number }[];
  transactionId: string;
  createdAt: string | number | Date;
  po?: string;
  dueDate?: string;
  totalPrice: number;
  totalQuantity: number;
  tax: number;
  grandAmount: number;
  status: string;
  paymentStatus: string;
  invoiceLink?: string;
};

export const generateInvoicePDF = async (orderData: TPopulatedOrder): Promise<Buffer> => {

  const logoUrl = "https://i.postimg.cc/gjhSbS06/resturent.png";

  // fetch logo
  const logoResponse = await axios.get(logoUrl, { responseType: "arraybuffer" });
  const logoBuffer = Buffer.from(logoResponse.data);

  // fetch food images
  const imageBuffers = await Promise.all(
    orderData.foods.map(async (item) => {
      try {
        const response = await axios.get(item.food.image, {
          responseType: "arraybuffer",
        });
        return Buffer.from(response.data);
      } catch (error) {
        console.log("Image load failed:", item.food.name);
        return null;
      }
    })
  );

  return new Promise((resolve, reject) => {

    const doc = new PDFDocument({ margin: 50, size: "A4" });

    const buffers: Buffer[] = [];

    doc.on("data", (chunk) => buffers.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(buffers as Uint8Array[])));
    doc.on("error", (err) => reject(err));

    const primaryBlue = "#1e3a8a";
    const accentOrange = "#f97316";
    const textGray = "#4a5568";
    const textDark = "#1a202c";

    // INVOICE TITLE
    doc.fillColor(primaryBlue)
      .fontSize(40)
      .font("Helvetica-Bold")
      .text("INVOICE", 50, 50);

    // LOGO
    doc.image(logoBuffer, 470, 40, { width: 90 });

    // COMPANY INFO
    doc.fillColor(textDark)
      .fontSize(12)
      .font("Helvetica-Bold")
      .text("SnackZilla", 50, 110);

    doc.font("Helvetica")
      .fontSize(10)
      .fillColor(textGray)
      .text("House 2, Road 3, Sector 6, Uttara, Dhaka-1230", 50, 125);

    const gridY = 180;

    // BILL TO
    doc.fillColor(textDark)
      .fontSize(10)
      .font("Helvetica-Bold")
      .text("BILL TO", 50, gridY);

    const userAddress = orderData.user.address;

    const fullAddress =
      userAddress && typeof userAddress === "object"
        ? `${userAddress.street}, ${userAddress.city}${
            userAddress.state ? `, ${userAddress.state}` : ""
          }, ${userAddress.postalCode}, ${userAddress.country}`
        : "Address not provided";

    doc.font("Helvetica")
      .text(orderData.user.name || "Customer", 50, gridY + 15);

    doc.fillColor(textGray)
      .text(fullAddress, 50, gridY + 30, { width: 150 });

    if (orderData.user.phone) {
      doc.text(`Phone: ${orderData.user.phone}`, 50, doc.y + 5);
    }

    // INVOICE INFO
    const infoX = 350;

    doc.fillColor(primaryBlue)
      .font("Helvetica-Bold")
      .text("INVOICE #", infoX, gridY)
      .text("INVOICE DATE", infoX, gridY + 25)
      .text("P.O.#", infoX, gridY + 50)
      .text("DUE DATE", infoX, gridY + 75);

    doc.fillColor(textDark)
      .font("Helvetica")
      .text(orderData.transactionId || "N/A", 450, gridY, {
        width: 120,
        align: "right",
        lineBreak: false,
      })
      .text(
        new Date(orderData.createdAt || Date.now()).toLocaleDateString(),
        450,
        gridY + 25,
        { width: 120, align: "right" }
      )
      .text(orderData.po || "N/A", 450, gridY + 50, {
        width: 120,
        align: "right",
      })
      .text(orderData.dueDate || "N/A", 450, gridY + 75, {
        width: 120,
        align: "right",
      });

    // TABLE HEADER
    const tableTop = 280;

    doc.strokeColor(accentOrange)
      .lineWidth(2)
      .moveTo(50, tableTop + 20)
      .lineTo(550, tableTop + 20)
      .stroke();

    doc.fillColor(primaryBlue)
      .font("Helvetica-Bold")
      .fontSize(10);

    doc.text("SL", 50, tableTop, { width: 40, align: "center" });
    doc.text("IMAGE", 90, tableTop, { width: 60, align: "center" });
    doc.text("ITEM", 160, tableTop);
    doc.text("QTY", 330, tableTop, { width: 40, align: "center" });
    doc.text("PRICE", 380, tableTop, { width: 80, align: "right" });
    doc.text("AMOUNT", 470, tableTop, { width: 80, align: "right" });

    // TABLE BODY
    let y = tableTop + 35;

    orderData.foods.forEach((item, index: number) => {

      doc.fillColor(textDark).font("Helvetica");

      doc.text((index + 1).toString(), 50, y + 15, {
        width: 40,
        align: "center",
      });

      if (imageBuffers[index]) {
        doc.image(imageBuffers[index], 100, y, { width: 40, height: 40 });
      } else {
        doc.text("N/A", 90, y + 15);
      }

      doc.text(item.food.name, 160, y + 15, { width: 150 });

      doc.text(item.quantity.toString(), 330, y + 15, {
        width: 40,
        align: "center",
      });

      doc.text(`$${item.food.price.toFixed(2)}`, 380, y + 15, {
        width: 80,
        align: "right",
      });

      doc.text(`$${(item.food.price * item.quantity).toFixed(2)}`, 470, y + 15, {
        width: 80,
        align: "right",
      });

      doc.strokeColor("#edf2f7")
        .lineWidth(0.5)
        .moveTo(50, y + 45)
        .lineTo(550, y + 45)
        .stroke();

      y += 55;
    });

    // TOTALS
    const totalsY = y + 10;

    doc.fillColor(textGray)
      .fontSize(10)
      .text("Subtotal", 350, totalsY, { width: 100, align: "right" });

    doc.text(`$${orderData.totalPrice.toFixed(2)}`, 460, totalsY, {
      width: 90,
      align: "right",
    });

    doc.text("Tax", 350, totalsY + 20, { width: 100, align: "right" });

    doc.text(`$${orderData.tax.toFixed(2)}`, 460, totalsY + 20, {
      width: 90,
      align: "right",
    });

    doc.fillColor(primaryBlue)
      .fontSize(14)
      .font("Helvetica-Bold")
      .text("TOTAL", 350, totalsY + 45, { width: 100, align: "right" });

    doc.text(`$${orderData.grandAmount.toFixed(2)}`, 460, totalsY + 45, {
      width: 90,
      align: "right",
    });

    // FOOTER
    doc.fillColor(primaryBlue)
      .fontSize(10)
      .text("Thank you for your order!", 0, 730, { align: "center" });

    doc.end();

  });
};