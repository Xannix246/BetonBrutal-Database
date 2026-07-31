import { Buffer } from 'buffer';
import {
  Block,
  Color,
  Trigger,
  Group as ProtoGroup,
} from 'src/generated/protos/multiplayer';
import {
  Group,
  SessionCollab,
  SessionPlayer,
} from 'src/modules/multiplayer/types/multiplayer';

class BinaryWriter {
  private buffer: Uint8Array;
  private pos = 0;
  private length = 0;

  constructor(initialSize = 4096) {
    this.buffer = new Uint8Array(initialSize);
  }

  private ensureCapacity(size: number) {
    if (this.buffer.length >= size) return;
    let newCapacity = this.buffer.length;
    while (newCapacity < size) newCapacity *= 2;
    const newBuffer = new Uint8Array(newCapacity);
    newBuffer.set(this.buffer.subarray(0, this.length));
    this.buffer = newBuffer;
  }

  public writeUInt8(value: number) {
    this.ensureCapacity(this.pos + 1);
    this.buffer[this.pos++] = value & 0xff;
    this.length = Math.max(this.length, this.pos);
  }

  public writeInt32LE(value: number) {
    this.ensureCapacity(this.pos + 4);
    const view = new DataView(
      this.buffer.buffer,
      this.buffer.byteOffset,
      this.buffer.byteLength,
    );
    view.setInt32(this.pos, value, true);
    this.pos += 4;
    this.length = Math.max(this.length, this.pos);
  }

  public writeBoolean(value: boolean) {
    this.writeUInt8(value ? 1 : 0);
  }

  public writeBytes(bytes: Uint8Array) {
    this.ensureCapacity(this.pos + bytes.length);
    this.buffer.set(bytes, this.pos);
    this.pos += bytes.length;
    this.length = Math.max(this.length, this.pos);
  }

  public writeString(value: string) {
    const encoder = new TextEncoder();
    const bytes = encoder.encode(value);
    this.write7BitEncodedInt(bytes.length);
    this.writeBytes(bytes);
  }

  public write7BitEncodedInt(value: number) {
    let v = value >>> 0;
    while (v >= 0x80) {
      this.writeUInt8((v & 0x7f) | 0x80);
      v >>>= 7;
    }
    this.writeUInt8(v);
  }

  public writeProtoMessage(
    message: any,
    protoType: { toBinary: (msg: any) => Uint8Array },
  ) {
    const bytes = protoType.toBinary(message);
    this.write7BitEncodedInt(bytes.length);
    this.writeBytes(bytes);
  }

  public toBuffer(): Buffer<ArrayBuffer> {
    return Buffer.from(this.buffer.subarray(0, this.length));
  }
}

class BinaryReader {
  private buffer: Buffer;
  private pos = 0;

  constructor(buffer: Buffer) {
    this.buffer = buffer;
  }

  public readUInt8(): number {
    const value = this.buffer.readUInt8(this.pos);
    this.pos += 1;
    return value;
  }

  public readInt32LE(): number {
    const value = this.buffer.readInt32LE(this.pos);
    this.pos += 4;
    return value;
  }

  public readBoolean(): boolean {
    return this.readUInt8() !== 0;
  }

  public readBytes(length: number): Buffer {
    const slice = this.buffer.slice(this.pos, this.pos + length);
    this.pos += length;
    return slice;
  }

  public readString(): string {
    const length = this.read7BitEncodedInt();
    const bytes = this.readBytes(length);
    return new TextDecoder('utf-8').decode(bytes);
  }

  public read7BitEncodedInt(): number {
    let count = 0;
    let shift = 0;
    let byte = 0;
    do {
      if (shift >= 35) throw new Error('Invalid 7-bit encoded integer');
      byte = this.readUInt8();
      count |= (byte & 0x7f) << shift;
      shift += 7;
    } while ((byte & 0x80) !== 0);
    return count;
  }

  public readProtoMessage<T>(protoType: {
    fromBinary: (bytes: Uint8Array) => T;
  }): T {
    const length = this.read7BitEncodedInt();
    const bytes = this.readBytes(length);
    return protoType.fromBinary(bytes);
  }
}

export function serializeCollab(session: SessionCollab): Buffer<ArrayBuffer> {
  const writer = new BinaryWriter();

  writer.writeString(session.id);

  writer.writeInt32LE(session.blocks.size);
  for (const [key, block] of session.blocks) {
    writer.writeString(key);
    writer.writeProtoMessage(block, Block);
  }

  writer.writeInt32LE(session.groups.size);
  for (const [key, group] of session.groups) {
    writer.writeString(key);
    writer.writeProtoMessage(
      {
        instanceId: group.instanceId,
        name: group.name,
        blocks: [...group.blocks],
        pivot: group.pivot,
      },
      ProtoGroup,
    );
  }

  writer.writeInt32LE(session.settings.size);
  for (const [settingKey, state] of session.settings) {
    writer.writeInt32LE(settingKey);
    writer.writeBoolean(state);
  }

  writer.writeInt32LE(session.color.size);
  for (const [colorKey, colorVal] of session.color) {
    writer.writeInt32LE(colorKey);
    writer.writeProtoMessage(colorVal, Color);
  }

  writer.writeInt32LE(session.triggers.size);
  for (const [key, trigger] of session.triggers) {
    writer.writeString(key);
    writer.writeProtoMessage(trigger, Trigger);
  }

  return writer.toBuffer();
}

export function deserializeCollab(
  buffer: Buffer,
  player: SessionPlayer,
): SessionCollab {
  const reader = new BinaryReader(buffer);

  const id = reader.readString();
  const owner = player;

  const players = new Set<SessionPlayer>();

  const blocks = new Map<string, Block>();
  const blocksCount = reader.readInt32LE();
  for (let i = 0; i < blocksCount; i++) {
    const key = reader.readString();
    blocks.set(key, reader.readProtoMessage(Block));
  }

  const groups = new Map<string, Group>();
  const groupsCount = reader.readInt32LE();
  for (let i = 0; i < groupsCount; i++) {
    const key = reader.readString();
    const readGroup = reader.readProtoMessage(ProtoGroup);
    groups.set(key, {
      instanceId: readGroup.instanceId,
      name: readGroup.name,
      blocks: new Set(readGroup.blocks),
      pivot: readGroup.pivot,
    });
  }

  const settings = new Map<number, boolean>();
  const settingsCount = reader.readInt32LE();
  for (let i = 0; i < settingsCount; i++) {
    const settingKey = reader.readInt32LE();
    const state = reader.readBoolean();
    settings.set(settingKey, state);
  }

  const color = new Map<number, Color>();
  const colorCount = reader.readInt32LE();
  for (let i = 0; i < colorCount; i++) {
    const colorKey = reader.readInt32LE();
    const colorVal = reader.readProtoMessage(Color);
    color.set(colorKey, colorVal);
  }

  const triggers = new Map<string, Trigger>();
  const triggersCount = reader.readInt32LE();
  for (let i = 0; i < triggersCount; i++) {
    const key = reader.readString();
    triggers.set(key, reader.readProtoMessage(Trigger));
  }

  return new SessionCollab({
    id,
    owner,
    players,
    blocks,
    groups,
    settings,
    color,
    triggers,
  });
}
