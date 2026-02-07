export class Texture {
  constructor(
    public texture: GPUTexture,
    public sampler: GPUSampler,
    public id: string,
    public width: number,
    public height: number,
  ) {}

  public static async createEmptyTexture(
    device: GPUDevice,
    width: number,
    height: number,
    format: GPUTextureFormat = "rgba8unorm",
  ): Promise<Texture> {
    const texture = device.createTexture({
      size: { width, height },
      format: format,
      usage:
        GPUTextureUsage.COPY_DST |
        GPUTextureUsage.TEXTURE_BINDING |
        GPUTextureUsage.RENDER_ATTACHMENT,
    });

    const sampler = device.createSampler({
      magFilter: "nearest",
      minFilter: "nearest",
    });

    return new Texture(texture, sampler, "", width, height);
  }

  public static async createTextureFromURL(
    device: GPUDevice,
    url: string,
  ): Promise<Texture> {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new Image();
      image.src = url;
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error(`Failed to load image ${url}`));
    });

    const texture = device.createTexture({
      size: { width: img.width, height: img.height },
      format: "rgba8unorm",
      usage:
        GPUTextureUsage.COPY_DST |
        GPUTextureUsage.TEXTURE_BINDING |
        GPUTextureUsage.RENDER_ATTACHMENT,
    });

    const bitmap = await createImageBitmap(img);

    device.queue.copyExternalImageToTexture(
      { source: bitmap },
      { texture },
      { width: img.width, height: img.height },
    );

    const sampler = device.createSampler({
      magFilter: "linear",
      minFilter: "linear",
    });

    return new Texture(texture, sampler, img.src, img.width, img.height);
  }
}
