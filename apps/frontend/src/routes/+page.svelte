<script lang="ts">
  import {
    toUpper,
    createMessage,
    logActivity,
    getAppInfo,
  } from '$lib/all.remote';

  // Query example
  let message = $state('Hello, world!');

  // Command example
  let commandResult = $state('');

  // Prerender example
  let appInfo = $derived(getAppInfo());

  async function trackActivity(action: string) {
    try {
      await logActivity(action);
      commandResult = `✅ Logged: ${action}`;
      setTimeout(() => (commandResult = ''), 2000);
    } catch (error) {
      commandResult = `❌ Failed to log activity: ${error}`;
    }
  }
</script>

<!-- Hero Section -->
<section class="hero">
  <div class="hero-content">
    <div class="badge">
      <span class="badge-icon">🚀</span>
      <span>SvelteKit Remote Functions</span>
    </div>

    <h1 class="hero-title">
      Cross-Deployment
      <span class="gradient-text">Remote Functions</span>
    </h1>

    <p class="hero-subtitle">
      Static frontend calling separate backend. Perfect for mobile apps, CDN
      deployments, and serverless architectures.
    </p>
  </div>

  <!-- Animated background -->
  <div class="hero-bg">
    <div class="floating-element" style="--delay: 0s; --duration: 8s;"></div>
    <div class="floating-element" style="--delay: 2s; --duration: 12s;"></div>
    <div class="floating-element" style="--delay: 4s; --duration: 10s;"></div>
  </div>
</section>

<!-- Demo Grid -->
<section class="demo-section">
  <div class="container">
    <h2 class="section-title">Interactive Demo</h2>
    <p class="section-subtitle">
      All four SvelteKit remote function types in action
    </p>

    <div class="demo-grid">
      <!-- Query Card -->
      <div class="demo-card query-card">
        <div class="card-header">
          <h3>🔍 Query</h3>
          <span class="card-badge">Dynamic Data</span>
        </div>

        <p class="card-description">Real-time data fetching from backend</p>

        <div class="input-group">
          <input
            type="text"
            bind:value={message}
            placeholder="Enter text to transform..."
            class="modern-input"
          />
          <button
            onclick={async () => {
              message = await toUpper(message);
            }}
            class="modern-button primary"
          >
            Transform ✨
          </button>
        </div>
      </div>

      <!-- Form Card -->
      <div class="demo-card form-card">
        <div class="card-header">
          <h3>📝 Form</h3>
          <span class="card-badge {createMessage.pending ? 'pending' : 'idle'}">
            {createMessage.pending
              ? 'Submitting...'
              : 'Progressive Enhancement'}
          </span>
        </div>

        <p class="card-description">
          Type-safe form handling with automatic validation
        </p>

        <form {...createMessage} class="modern-form">
          <div class="form-row">
            <input
              name="name"
              placeholder="Your name"
              class="modern-input"
              required
            />
            <textarea
              name="message"
              placeholder="Your message..."
              class="modern-textarea"
              required
            ></textarea>
          </div>
          <button
            type="submit"
            class="modern-button primary full-width"
            disabled={!!createMessage.pending}
          >
            {createMessage.pending ? '⏳ Submitting...' : '📤 Send Message'}
          </button>
        </form>

        {#if createMessage.result}
          <div class="success-toast">
            <div class="toast-icon">✅</div>
            <div>
              <strong>Message submitted!</strong>
              <small>ID: {createMessage.result.id}</small>
            </div>
          </div>
        {/if}
      </div>

      <!-- Command Card -->
      <div class="demo-card command-card">
        <div class="card-header">
          <h3>⚡ Command</h3>
          <span class="card-badge">Fire & Forget</span>
        </div>

        <p class="card-description">
          Execute server actions without return data
        </p>

        <div class="command-actions">
          <button
            onclick={() => trackActivity('page_view')}
            class="modern-button secondary"
          >
            👁️ Log View
          </button>
          <button
            onclick={() => trackActivity('interaction')}
            class="modern-button secondary"
          >
            🎯 Log Interaction
          </button>
        </div>

        {#if commandResult}
          <div
            class="command-feedback"
            class:success={commandResult.includes('✅')}
          >
            {commandResult}
          </div>
        {/if}
      </div>

      <!-- Prerender Card -->
      <div class="demo-card prerender-card">
        <div class="card-header">
          <h3>📊 Prerender</h3>
          <span class="card-badge">Build-time</span>
        </div>

        <p class="card-description">
          Static data generated at build time, cached globally
        </p>

        {#if appInfo.loading}
          <div class="loading-state">
            <div class="spinner"></div>
            <span>Loading app info...</span>
          </div>
        {:else if appInfo.ready}
          <div class="app-info">
            <h4>{appInfo.current.name}</h4>
            <div class="info-grid">
              <div class="info-item">
                <span class="info-label">Version</span>
                <span class="info-value">{appInfo.current.version}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Built</span>
                <span class="info-value"
                  >{new Date(
                    appInfo.current.buildTime
                  ).toLocaleDateString()}</span
                >
              </div>
            </div>
            <div class="features">
              {#each appInfo.current.features as feature}
                <span class="feature-tag">{feature}</span>
              {/each}
            </div>
          </div>
        {:else if appInfo.error}
          <div class="error-state">
            <div class="error-icon">⚠️</div>
            <div>
              <strong>Failed to load app info</strong>
              <small>{appInfo.error.message || 'Unknown error'}</small>
            </div>
          </div>
          <div class="limitation-note">
            <p>
              ℹ️ <strong>Expected behavior</strong>: Prerender functions
              currently fail cross-origin due to service worker limitations.
            </p>
            <p>
              <a
                href="https://github.com/robinbraemer/sveltekit-static-to-remote#%EF%B8%8F-known-limitation-prerender-cross-origin"
                target="_blank"
                rel="noopener"
              >
                📖 Read about this limitation
              </a>
              •
              <a
                href="https://github.com/robinbraemer/sveltekit-static-to-remote/issues"
                target="_blank"
                rel="noopener"
              >
                🚀 PRs welcome to fix
              </a>
            </p>
          </div>
        {/if}
      </div>
    </div>
  </div>
</section>

<style>
  :global(body) {
    margin: 0;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    min-height: 100vh;
    font-family:
      'Inter',
      -apple-system,
      BlinkMacSystemFont,
      'Segoe UI',
      Roboto,
      sans-serif;
  }

  /* Hero Section */
  .hero {
    position: relative;
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  }

  .hero-content {
    text-align: center;
    z-index: 2;
    max-width: 800px;
    padding: 2rem;
  }

  .badge {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    background: rgba(255, 255, 255, 0.15);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 50px;
    padding: 0.5rem 1.5rem;
    color: white;
    font-size: 0.9rem;
    font-weight: 500;
    margin-bottom: 2rem;
    animation: fadeInUp 0.8s ease-out;
  }

  .badge-icon {
    font-size: 1.2rem;
  }

  .hero-title {
    font-size: clamp(3rem, 8vw, 5rem);
    font-weight: 900;
    color: white;
    margin: 0 0 1.5rem 0;
    line-height: 1.1;
    animation: fadeInUp 0.8s ease-out 0.2s both;
  }

  .gradient-text {
    background: linear-gradient(45deg, #ff6b6b, #ffa500, #ff6b6b);
    background-size: 200% 200%;
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
    animation: gradientShift 3s ease-in-out infinite;
  }

  .hero-subtitle {
    font-size: 1.25rem;
    color: rgba(255, 255, 255, 0.9);
    margin: 0 0 3rem 0;
    max-width: 600px;
    margin-left: auto;
    margin-right: auto;
    line-height: 1.6;
    animation: fadeInUp 0.8s ease-out 0.4s both;
  }

  .error-state {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.75rem;
    padding: 2rem;
    color: #ef4444;
    text-align: center;
  }

  .error-icon {
    font-size: 1.5rem;
  }

  .limitation-note {
    background: #fffbeb;
    border: 1px solid #fed7aa;
    border-radius: 12px;
    padding: 1.5rem;
    margin-top: 1rem;
    color: #92400e;
    font-size: 0.9rem;
    line-height: 1.5;
  }

  .limitation-note p {
    margin: 0 0 0.5rem 0;
  }

  .limitation-note p:last-child {
    margin-bottom: 0;
  }

  .limitation-note a {
    color: #dc2626;
    text-decoration: none;
    font-weight: 500;
    transition: color 0.2s;
  }

  .limitation-note a:hover {
    color: #b91c1c;
    text-decoration: underline;
  }

  /* Floating Background Elements */
  .hero-bg {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    overflow: hidden;
  }

  .floating-element {
    position: absolute;
    width: 200px;
    height: 200px;
    background: linear-gradient(
      45deg,
      rgba(255, 255, 255, 0.1),
      rgba(255, 255, 255, 0.05)
    );
    border-radius: 50%;
    animation: float var(--duration) ease-in-out infinite var(--delay);
    backdrop-filter: blur(10px);
  }

  .floating-element:nth-child(1) {
    top: 10%;
    left: 10%;
  }
  .floating-element:nth-child(2) {
    top: 60%;
    right: 10%;
  }
  .floating-element:nth-child(3) {
    bottom: 20%;
    left: 20%;
  }

  /* Demo Section */
  .demo-section {
    padding: 4rem 0;
    background: #f8fafc;
    min-height: 100vh;
  }

  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 2rem;
  }

  .section-title {
    font-size: 3rem;
    font-weight: 800;
    text-align: center;
    margin: 0 0 1rem 0;
    background: linear-gradient(135deg, #667eea, #764ba2);
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  .section-subtitle {
    text-align: center;
    font-size: 1.2rem;
    color: #64748b;
    margin: 0 0 4rem 0;
    font-weight: 400;
  }

  .demo-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
    gap: 2rem;
    margin-top: 3rem;
  }

  .demo-card {
    background: white;
    border-radius: 20px;
    padding: 2rem;
    box-shadow:
      0 4px 6px -1px rgba(0, 0, 0, 0.1),
      0 2px 4px -1px rgba(0, 0, 0, 0.06);
    border: 1px solid #e2e8f0;
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;
  }

  .demo-card:hover {
    transform: translateY(-4px);
    box-shadow:
      0 20px 25px -5px rgba(0, 0, 0, 0.1),
      0 10px 10px -5px rgba(0, 0, 0, 0.04);
  }

  .demo-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(
      90deg,
      var(--accent-color),
      var(--accent-light)
    );
  }

  .query-card {
    --accent-color: #3b82f6;
    --accent-light: #60a5fa;
  }
  .form-card {
    --accent-color: #10b981;
    --accent-light: #34d399;
  }
  .command-card {
    --accent-color: #f59e0b;
    --accent-light: #fbbf24;
  }
  .prerender-card {
    --accent-color: #8b5cf6;
    --accent-light: #a78bfa;
  }

  .card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 1rem;
  }

  .card-header h3 {
    font-size: 1.5rem;
    font-weight: 700;
    margin: 0;
    color: #1e293b;
  }

  .card-badge {
    background: var(--accent-color);
    color: white;
    padding: 0.25rem 0.75rem;
    border-radius: 50px;
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .card-badge.pending {
    background: #f59e0b;
    animation: pulse 2s ease-in-out infinite;
  }

  .card-description {
    color: #64748b;
    margin-bottom: 2rem;
    font-size: 0.95rem;
    line-height: 1.6;
  }

  /* Modern Input Styles */
  .input-group {
    display: flex;
    gap: 1rem;
    flex-direction: column;
  }

  .modern-input,
  .modern-textarea {
    background: #f8fafc;
    border: 2px solid #e2e8f0;
    border-radius: 12px;
    padding: 1rem 1.5rem;
    font-size: 1rem;
    font-family: inherit;
    transition: all 0.2s ease;
    outline: none;
  }

  .modern-input:focus,
  .modern-textarea:focus {
    border-color: var(--accent-color);
    background: white;
    box-shadow: 0 0 0 4px rgba(var(--accent-color), 0.1);
  }

  .modern-textarea {
    resize: vertical;
    min-height: 100px;
    font-family: inherit;
  }

  .modern-button {
    background: var(--accent-color);
    color: white;
    border: none;
    border-radius: 12px;
    padding: 1rem 2rem;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    outline: none;
    position: relative;
    overflow: hidden;
  }

  .modern-button:hover:not(:disabled) {
    background: var(--accent-light);
    transform: translateY(-1px);
    box-shadow: 0 10px 25px rgba(var(--accent-color), 0.3);
  }

  .modern-button:active {
    transform: translateY(0);
  }

  .modern-button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none !important;
  }

  .modern-button.secondary {
    background: #64748b;
    --accent-light: #475569;
  }

  .modern-button.primary::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.2),
      transparent
    );
    transition: left 0.5s ease;
  }

  .modern-button.primary:hover::before {
    left: 100%;
  }

  .full-width {
    width: 100%;
  }

  /* Form Styles */
  .modern-form {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .form-row {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  /* Command Actions */
  .command-actions {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
    margin-bottom: 1.5rem;
  }

  .command-feedback {
    background: #fef2f2;
    border: 1px solid #fecaca;
    color: #dc2626;
    padding: 1rem;
    border-radius: 12px;
    font-weight: 500;
    text-align: center;
  }

  .command-feedback.success {
    background: #f0fdf4;
    border-color: #bbf7d0;
    color: #166534;
  }

  /* Success Toast */
  .success-toast {
    display: flex;
    align-items: center;
    gap: 1rem;
    background: #f0fdf4;
    border: 1px solid #bbf7d0;
    border-radius: 12px;
    padding: 1rem;
    margin-top: 1.5rem;
    color: #166534;
    animation: slideInUp 0.3s ease-out;
  }

  .toast-icon {
    font-size: 1.5rem;
  }

  .success-toast strong {
    display: block;
    margin-bottom: 0.25rem;
  }

  .success-toast small {
    opacity: 0.8;
    font-size: 0.85rem;
  }

  /* App Info */
  .app-info h4 {
    font-size: 1.25rem;
    font-weight: 700;
    color: #1e293b;
    margin: 0 0 1rem 0;
  }

  .info-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
    margin-bottom: 1.5rem;
  }

  .info-item {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .info-label {
    font-size: 0.8rem;
    color: #64748b;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .info-value {
    font-weight: 600;
    color: #1e293b;
  }

  .features {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .feature-tag {
    background: rgba(var(--accent-color), 0.1);
    color: var(--accent-color);
    padding: 0.25rem 0.75rem;
    border-radius: 50px;
    font-size: 0.8rem;
    font-weight: 500;
  }

  /* Loading States */
  .loading-state {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    padding: 2rem;
    color: #64748b;
  }

  .spinner {
    width: 24px;
    height: 24px;
    border: 3px solid #e2e8f0;
    border-top: 3px solid var(--accent-color);
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  /* Animations */
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes slideInUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes gradientShift {
    0%,
    100% {
      background-position: 0% 50%;
    }
    50% {
      background-position: 100% 50%;
    }
  }

  @keyframes float {
    0%,
    100% {
      transform: translateY(0) rotate(0deg);
    }
    33% {
      transform: translateY(-30px) rotate(10deg);
    }
    66% {
      transform: translateY(20px) rotate(-5deg);
    }
  }

  @keyframes pulse {
    0%,
    100% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  /* Responsive Design */
  @media (max-width: 768px) {
    .hero-content {
      padding: 1rem;
    }

    .demo-grid {
      grid-template-columns: 1fr;
      gap: 1.5rem;
    }

    .demo-card {
      padding: 1.5rem;
    }

    .command-actions {
      grid-template-columns: 1fr;
    }

    .input-group {
      gap: 0.75rem;
    }
  }

  @media (max-width: 480px) {
    .hero {
      min-height: 90vh;
    }

    .demo-section {
      padding: 2rem 0;
    }

    .container {
      padding: 0 1rem;
    }
  }
</style>
