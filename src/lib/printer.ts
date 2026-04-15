// Thermal Printer Utilities

// ── Browser Print (works with any printer) ──
export function browserPrint() {
  window.print();
}

// ── ESC/POS via WebUSB ──
let usbDevice: any = null;

export async function connectUSBPrinter(): Promise<boolean> {
  try {
    if (!("usb" in navigator)) {
      throw new Error("WebUSB not supported. Use Chrome browser.");
    }
    usbDevice = await (navigator as any).usb.requestDevice({
      filters: [
        { vendorId: 0x0416 }, // WinChipHead (common thermal)
        { vendorId: 0x0fe6 }, // ICS
        { vendorId: 0x0483 }, // STMicroelectronics
        { vendorId: 0x04b8 }, // Epson
        { vendorId: 0x0519 }, // Star Micronics
      ],
    });
    await usbDevice.open();
    if (usbDevice.configuration === null) {
      await usbDevice.selectConfiguration(1);
    }
    await usbDevice.claimInterface(0);
    return true;
  } catch (err) {
    console.error("USB Printer connection failed:", err);
    return false;
  }
}

export function isUSBPrinterConnected(): boolean {
  return usbDevice !== null && usbDevice.opened;
}

export async function printESCPOS(lines: string[], total?: string): Promise<boolean> {
  if (!usbDevice || !usbDevice.opened) return false;

  try {
    const encoder = new TextEncoder();
    const ESC = 0x1B;
    const GS = 0x1D;

    // Initialize printer
    const init = new Uint8Array([ESC, 0x40]);
    // Center align
    const center = new Uint8Array([ESC, 0x61, 0x01]);
    // Left align
    const left = new Uint8Array([ESC, 0x61, 0x00]);
    // Bold on/off
    const boldOn = new Uint8Array([ESC, 0x45, 0x01]);
    const boldOff = new Uint8Array([ESC, 0x45, 0x00]);
    // Double size
    const doubleSize = new Uint8Array([GS, 0x21, 0x11]);
    const normalSize = new Uint8Array([GS, 0x21, 0x00]);
    // Cut paper
    const cut = new Uint8Array([GS, 0x56, 0x00]);
    // Feed
    const feed = new Uint8Array([0x0A]);

    const endpointNumber = usbDevice.configuration?.interfaces[0]?.alternate?.endpoints?.find(
      (e: any) => e.direction === "out"
    )?.endpointNumber || 1;

    const send = async (data: Uint8Array) => {
      await usbDevice!.transferOut(endpointNumber, data);
    };

    await send(init);
    await send(center);
    await send(boldOn);
    await send(doubleSize);
    await send(encoder.encode("DukaFy\n"));
    await send(normalSize);
    await send(boldOff);
    await send(encoder.encode("--------------------------------\n"));
    await send(left);

    for (const line of lines) {
      await send(encoder.encode(line + "\n"));
    }

    if (total) {
      await send(encoder.encode("--------------------------------\n"));
      await send(boldOn);
      await send(encoder.encode(`TOTAL: ${total}\n`));
      await send(boldOff);
    }

    await send(encoder.encode("\n"));
    await send(center);
    await send(encoder.encode("Thank you for shopping!\n\n\n"));
    await send(cut);

    return true;
  } catch (err) {
    console.error("ESC/POS print failed:", err);
    return false;
  }
}

export async function disconnectUSBPrinter(): Promise<void> {
  if (usbDevice && usbDevice.opened) {
    await usbDevice.close();
    usbDevice = null;
  }
}
