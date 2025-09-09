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

  // Prerender example - static data loaded at build time
  let appInfo = $state<any>(null);

  // Load prerendered data
  $effect(() => {
    getAppInfo().then((data) => (appInfo = data));
  });

  async function trackActivity(action: string) {
    try {
      await logActivity(action);
      commandResult = `✅ Logged: ${action}`;
      setTimeout(() => (commandResult = ''), 2000);
    } catch (error) {
      commandResult = `❌ Failed to log activity`;
    }
  }
</script>

<div class="container">
  <h1>🚀 SvelteKit Remote Functions Demo</h1>
  <p class="subtitle">All four types working across separate deployments!</p>

  <!-- Prerender Example -->
  <section class="section">
    <h2>📊 Prerender - Static Data</h2>
    <div class="card">
      {#if appInfo}
        <h3>{appInfo.name}</h3>
        <p>Version: {appInfo.version}</p>
        <p>Features: {appInfo.features.join(', ')}</p>
        <small>Built: {new Date(appInfo.buildTime).toLocaleString()}</small>
      {:else}
        <p>Loading...</p>
      {/if}
    </div>
  </section>

  <!-- Query Example -->
  <section class="section">
    <h2>🔍 Query - Dynamic Data</h2>
    <div class="card">
      <input
        type="text"
        bind:value={message}
        placeholder="Enter text to convert"
        class="input"
      />
      <button
        onclick={async () => {
          message = await toUpper(message);
        }}
        class="button primary"
      >
        Convert to UPPERCASE
      </button>
    </div>
  </section>

  <!-- Form Example -->
  <section class="section">
    <h2>📝 Form - Write Data</h2>
    <div class="card">
      <p class="description">
        This form uses the official SvelteKit pattern with progressive
        enhancement.
      </p>

      <!-- Official SvelteKit form pattern -->
      <form {...createMessage} class="form">
        <label>
          Name
          <input name="name" required class="input" />
        </label>

        <label>
          Message
          <textarea name="message" required class="textarea"></textarea>
        </label>

        <button type="submit" class="button primary"> Submit Message </button>
      </form>

      <div class="info">
        <p><strong>Progressive Enhancement:</strong></p>
        <ul>
          <li>✅ Works without JavaScript</li>
          <li>✅ Enhanced with JavaScript</li>
          <li>✅ Automatic validation</li>
        </ul>
      </div>
    </div>
  </section>

  <!-- Command Example -->
  <section class="section">
    <h2>⚡ Command - Actions</h2>
    <div class="card">
      <div class="buttons">
        <button
          onclick={() => trackActivity('page_view')}
          class="button secondary"
        >
          Log Page View
        </button>
        <button
          onclick={() => trackActivity('button_click')}
          class="button secondary"
        >
          Log Button Click
        </button>
      </div>

      {#if commandResult}
        <div class="result">{commandResult}</div>
      {/if}
    </div>
  </section>
</div>

<style>
  .container {
    max-width: 800px;
    margin: 0 auto;
    padding: 2rem;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
      sans-serif;
  }

  h1 {
    text-align: center;
    color: #333;
    margin-bottom: 0.5rem;
  }

  .subtitle {
    text-align: center;
    color: #666;
    margin-bottom: 3rem;
    font-style: italic;
  }

  .section {
    margin-bottom: 3rem;
  }

  .section h2 {
    color: #333;
    border-bottom: 2px solid #0077ff;
    padding-bottom: 0.5rem;
    margin-bottom: 1.5rem;
  }

  .card {
    background: #fff;
    border-radius: 12px;
    padding: 2rem;
    box-shadow: 0 2px 16px rgba(0, 0, 0, 0.1);
    border: 1px solid #e1e8ed;
  }

  .card h3 {
    margin-top: 0;
    color: #333;
  }

  .description {
    color: #666;
    font-style: italic;
    margin-bottom: 1.5rem;
  }

  .form {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    margin-bottom: 1.5rem;
  }

  .form label {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    font-weight: 500;
    color: #333;
  }

  .input,
  .textarea {
    padding: 0.75rem;
    border: 1px solid #ced4da;
    border-radius: 6px;
    font-size: 1rem;
    transition:
      border-color 0.15s,
      box-shadow 0.15s;
  }

  .input:focus,
  .textarea:focus {
    outline: 0;
    border-color: #0077ff;
    box-shadow: 0 0 0 2px rgba(0, 119, 255, 0.25);
  }

  .textarea {
    resize: vertical;
    min-height: 80px;
    font-family: inherit;
  }

  .button {
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 6px;
    font-size: 1rem;
    cursor: pointer;
    transition: all 0.2s;
    font-weight: 500;
  }

  .button.primary {
    background: #0077ff;
    color: #fff;
  }

  .button.primary:hover:not(:disabled) {
    background: #005fcc;
  }

  .button.secondary {
    background: #6c757d;
    color: #fff;
  }

  .button.secondary:hover:not(:disabled) {
    background: #545b62;
  }

  .button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .buttons {
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
    margin-bottom: 1rem;
  }

  .result {
    padding: 0.75rem;
    background: #e3f2fd;
    border: 1px solid #bbdefb;
    border-radius: 6px;
    color: #0d47a1;
    font-weight: 500;
  }

  .info {
    background: #f8f9fa;
    border: 1px solid #e9ecef;
    border-radius: 8px;
    padding: 1rem;
    margin-top: 1rem;
  }

  .info p {
    margin-top: 0;
    margin-bottom: 0.5rem;
    font-weight: 500;
  }

  .info ul {
    margin-bottom: 0;
    padding-left: 1.5rem;
  }

  .info li {
    margin-bottom: 0.25rem;
  }

  /* Responsive design */
  @media (max-width: 768px) {
    .container {
      padding: 1rem;
    }

    .card {
      padding: 1.5rem;
    }

    .buttons {
      flex-direction: column;
    }
  }
</style>
