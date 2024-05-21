class Circle {
  x: number
  y: number
  radius: number
  color: string
  dy: number
  gravity: number
  damping: number
  isActive: boolean
  restThreshold: number
  
  constructor(x: number, y: number) {
    this.x = x
    this.y = y
    this.radius = 25
    this.color = this.getRandomColor()
    this.dy = 0
    this.gravity = 980
    this.damping = 0.7
    this.isActive = true
    this.restThreshold = 0.1
  }

  getRandomColor(): string {
    const letters = '0123456789ABCDEF'
    let color = '#'
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)]
    }
    return color
  }

  draw(ctx: CanvasRenderingContext2D): void {
    this.drawShadow(ctx)
    ctx.beginPath()
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2)
    ctx.fillStyle = this.color
    ctx.fill()
    ctx.closePath()
  }

  drawShadow(ctx: CanvasRenderingContext2D): void {
    const maxShadowRadius = this.radius * 1.5
    const minShadowRadius = this.radius * 0.5
    const groundLevel = ctx.canvas.height
    const distanceFromGround = groundLevel - (this.y + this.radius)
    const normalizedDistance = Math.min(Math.max(distanceFromGround / groundLevel, 0), 1)
    const shadowRadius = minShadowRadius + (maxShadowRadius - minShadowRadius) * normalizedDistance
    const shadowOpacity = 0.5 * (1 - normalizedDistance)

    ctx.beginPath()
    ctx.ellipse(this.x, groundLevel - 5, shadowRadius, shadowRadius / 3, 0, 0, Math.PI * 2)
    ctx.fillStyle = `rgba(0, 0, 0, ${shadowOpacity})`
    ctx.fill()
    ctx.closePath()
  }

  isAtRest(): boolean {
    return Math.abs(this.dy) < this.restThreshold
  }

  update(canvasHeight: number, deltaTime: number): void {
    if (!this.isActive) {
      return
    }
    const deltaSeconds = deltaTime / 1000
    
    if (this.y + this.radius + this.dy * deltaSeconds > canvasHeight) {
      this.dy = -this.dy * this.damping
      if (this.isAtRest()) {
        this.isActive = false
        this.dy = 0
      }
    } else {
      this.dy += this.gravity * deltaSeconds
    }

    this.y += this.dy * deltaSeconds
  }
}

class Simulation {
  canvas: HTMLCanvasElement
  ctx: CanvasRenderingContext2D
  circles: Circle[]
  lastTime: number
  
  constructor() {
    this.canvas = document.getElementById('canvas') as HTMLCanvasElement
    this.ctx = this.canvas.getContext('2d')!
    this.circles = []
    this.lastTime = 0

    this.resizeCanvas()
    window.addEventListener('resize', () => this.resizeCanvas())
    this.canvas.addEventListener('click', event => this.spawnCircle(event))

    requestAnimationFrame(time => this.tick(time))
  }

  resizeCanvas(): void {
    this.canvas.width = window.innerWidth
    this.canvas.height = window.innerHeight
  }

  spawnCircle(event: MouseEvent): void {
    const rect = this.canvas.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top
    if (this.circles.length < 15) {
      this.circles.push(new Circle(x, y))
    }
  }

  tick(currentTime: number): void {
    const deltaTime = currentTime - this.lastTime
    this.lastTime = currentTime

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)

    for (const circle of this.circles) {
        circle.update(this.canvas.height, deltaTime)
    }

    for (const circle of this.circles) {
        circle.draw(this.ctx)
    }

    requestAnimationFrame(time => this.tick(time))
  }
}

new Simulation()