import { Vector3 } from 'src/modules/multiplayer/types/multiplayer';

export class PacketSerializer {
  private length = 0;

  constructor(
    public offset = 0,
    public buffer: Uint8Array,
  ) {}

  private ensureCapacity(size: number) {
    if (this.buffer.length >= size) {
      return;
    }

    let newCapacity = Math.max(1, this.buffer.length);
    while (newCapacity < size) {
      newCapacity *= 2;
    }

    const newBuffer = new Uint8Array(newCapacity);
    newBuffer.set(this.buffer.subarray(0, this.length));
    this.buffer = newBuffer;
  }

  public writeUInt8(value: number): void {
    this.ensureCapacity(this.offset + 1);
    this.buffer[this.offset++] = value & 0xff;
    this.length = Math.max(this.length, this.offset);
  }

  public writeUInt16(value: number): void {
    this.ensureCapacity(this.offset + 2);
    const view = new DataView(
      this.buffer.buffer,
      this.buffer.byteOffset,
      this.buffer.byteLength,
    );
    view.setUint16(this.offset, value, true);
    this.offset += 2;
    this.length = Math.max(this.length, this.offset);
  }

  public writeUInt32(value: number): void {
    this.ensureCapacity(this.offset + 4);
    const view = new DataView(
      this.buffer.buffer,
      this.buffer.byteOffset,
      this.buffer.byteLength,
    );
    view.setUint32(this.offset, value, true);
    this.offset += 4;
    this.length = Math.max(this.length, this.offset);
  }

  public writeInt32(value: number): void {
    this.ensureCapacity(this.offset + 4);
    const view = new DataView(
      this.buffer.buffer,
      this.buffer.byteOffset,
      this.buffer.byteLength,
    );
    view.setInt32(this.offset, value, true);
    this.offset += 4;
    this.length = Math.max(this.length, this.offset);
  }

  public writeUInt64(value: string): void {
    this.ensureCapacity(this.offset + 8);
    const view = new DataView(
      this.buffer.buffer,
      this.buffer.byteOffset,
      this.buffer.byteLength,
    );
    view.setBigUint64(this.offset, BigInt(value), true);
    this.offset += 8;
    this.length = Math.max(this.length, this.offset);
  }

  public writeFloat(value: number): void {
    this.ensureCapacity(this.offset + 4);
    const view = new DataView(
      this.buffer.buffer,
      this.buffer.byteOffset,
      this.buffer.byteLength,
    );
    view.setFloat32(this.offset, value, true);
    this.offset += 4;
    this.length = Math.max(this.length, this.offset);
  }

  public writeVector3(value: Vector3): void {
    this.writeFloat(value.x);
    this.writeFloat(value.y);
    this.writeFloat(value.z);
  }

  public writeBytes(bytes: Uint8Array) {
    this.ensureCapacity(this.offset + bytes.length);
    this.buffer.set(bytes, this.offset);
    this.offset += bytes.length;
    this.length = Math.max(this.length, this.offset);
  }

  public write7BitEncodedInt(value: number) {
    let v = value >>> 0;
    while (v >= 0x80) {
      this.writeUInt8((v & 0x7f) | 0x80);
      v >>>= 7;
    }
    this.writeUInt8(v);
  }

  public writeString(value: string): void {
    const encoder = new TextEncoder();
    const bytes = encoder.encode(value);
    this.writeUInt32(bytes.length);
    this.writeBytes(bytes);
  }

  public writeGuid(value: string): void {
    const bytes = this.guidToBytes(value);
    this.writeBytes(bytes);
  }

  private guidToBytes(value: string): Uint8Array {
    const normalized = value.replace(/-/g, '');
    if (/^[0-9a-fA-F]{32}$/.test(normalized)) {
      return new Uint8Array(Buffer.from(normalized, 'hex'));
    }

    if (value.length === 16) {
      return new TextEncoder().encode(value);
    }

    if (/^[A-Za-z0-9+/]+={0,2}$/.test(value) && value.length % 4 === 0) {
      return new Uint8Array(Buffer.from(value, 'base64'));
    }

    throw new Error(`Invalid GUID format: ${value}`);
  }

  public clearLength(number?: number): void {
    this.length = number ?? 0;
  }
}
