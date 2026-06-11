import { Vector3 } from 'src/modules/multiplayer/types/multiplayer';

export class PacketDeserializer {
  constructor(public offset = 0) {}

  public readUInt8(buffer: Buffer): number {
    const value = buffer.readUInt8(this.offset);
    this.offset += 1;
    return value;
  }

  public readUInt16(buffer: Buffer): number {
    const value = buffer.readUInt16LE(this.offset);
    this.offset += 2;
    return value;
  }

  public readUInt32(buffer: Buffer): number {
    const value = buffer.readUInt32LE(this.offset);
    this.offset += 4;
    return value;
  }

  public readInt32(buffer: Buffer): number {
    const value = buffer.readInt32LE(this.offset);
    this.offset += 4;
    return value;
  }

  public readUInt64(buffer: Buffer): string {
    const value = buffer.readBigUInt64LE(this.offset).toString();
    this.offset += 8;
    return value;
  }

  public readFloat(buffer: Buffer): number {
    const value = buffer.readFloatLE(this.offset);
    this.offset += 4;
    return value;
  }

  public readVector3(buffer: Buffer): Vector3 {
    const value: Vector3 = {
      x: buffer.readFloatLE(this.offset),
      y: buffer.readFloatLE(this.offset + 4),
      z: buffer.readFloatLE(this.offset + 8),
    };
    this.offset += 12;
    return value;
  }

  public readString(buffer: Buffer): string {
    const length = this.readUInt32(buffer);
    // Ensure we have enough bytes to read
    const value = buffer.toString('utf8', this.offset, this.offset + length);
    this.offset += length;
    return value;
  }

  public readGuid(buffer: Buffer): string {
    const bytes = buffer.subarray(this.offset, this.offset + 16);
    this.offset += 16;
    return Buffer.from(bytes).toString('hex');
  }

  public read7BitEncodedInt(buffer: Buffer): number {
    let count = 0;
    let shift = 0;
    let byte = 0;
    do {
      if (shift >= 35) {
        throw new Error('Invalid 7-bit encoded integer');
      }
      byte = this.readUInt8(buffer);
      count |= (byte & 0x7f) << shift;
      shift += 7;
    } while ((byte & 0x80) !== 0);
    return count;
  }
}
