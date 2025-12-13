export class BufferUtil {
  public static createVertexBuffer(
    data: Float32Array,
    device: GPUDevice
  ): GPUBuffer {
    const buffer = device.createBuffer({
      size: data.byteLength,
      usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
      mappedAtCreation: true,
    });
    new Float32Array(buffer.getMappedRange()).set(data);
    buffer.unmap();
    return buffer;
  }

  public static createIndexBuffer(
    data: Uint16Array,
    device: GPUDevice
  ): GPUBuffer {
    const buffer = device.createBuffer({
      size: data.byteLength,
      usage: GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST,
      mappedAtCreation: true,
    });
    new Uint16Array(buffer.getMappedRange()).set(data);
    buffer.unmap();
    return buffer;
  }

  public static createUniformBuffer(
    size: Float32Array,
    device: GPUDevice
  ): GPUBuffer {
    return device.createBuffer({
      size: size.byteLength,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });
  }
}
