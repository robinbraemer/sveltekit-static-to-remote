<script lang="ts">
  import {
    toUpper,
    submitMessage,
    logActivity,
    getStaticInfo,
  } from '$lib/all.remote';

  // Query example
  let message = $state('Hello, world!');
  let buttonBg = $state('#0077ff');


  // Command example
  let commandResult = $state('');

  // Prerender example - load static info on component initialization
  let staticInfo = $state<any>(null);
  let statsInfo = $state<any>(null);

  // Load prerendered data
  $effect(() => {
    getStaticInfo('default').then((data) => (staticInfo = data));
    getStaticInfo('stats').then((data) => (statsInfo = data));
  });


  async function trackActivity(action: string) {
    try {
      await logActivity({
        action,
        metadata: { timestamp: new Date().toISOString() },
      });
      commandResult = `✅ Activity "${action}" logged successfully`;
      setTimeout(() => (commandResult = ''), 3000);
    } catch (error) {
      commandResult = `❌ Failed to log activity`;
    }
  }
</script>

<div class="demo-container">
  <h1>🚀 SvelteKit Remote Functions Demo</h1>
  <p class="subtitle">All four types working across separate deployments!</p>

  <!-- Static Info Display (Prerender) -->
  <div class="section prerender-section">
    <h2>📊 Static Info (Prerender)</h2>
    <div class="info-grid">
      <div class="info-card">
        <h3>App Info</h3>
        {#if staticInfo}
          <p><strong>{staticInfo.appName}</strong></p>
          <p>Version: {staticInfo.version}</p>
          <p>Features: {staticInfo.features.join(', ')}</p>
          <small
            >Generated: {new Date(
              staticInfo.generatedAt
            ).toLocaleString()}</small
          >
        {:else}
          <p>Loading...</p>
        {/if}
      </div>
      <div class="info-card">
        <h3>Stats</h3>
        {#if statsInfo}
          <p>Users: {statsInfo.totalUsers.toLocaleString()}</p>
          <p>Projects: {statsInfo.totalProjects}</p>
          <p>Success Rate: {statsInfo.successRate}%</p>
          <small
            >Generated: {new Date(
              statsInfo.generatedAt
            ).toLocaleString()}</small
          >
        {:else}
          <p>Loading...</p>
        {/if}
      </div>
    </div>
  </div>

  <!-- Query Example -->
  <div class="section query-section">
    <h2>🔍 Text Converter (Query)</h2>
    <div class="converter">
      <input
        type="text"
        bind:value={message}
        placeholder="Enter text to convert"
        class="input"
      />
      <button
        on:click={async () => {
          message = await toUpper(message);
        }}
        class="button primary"
        on:mouseover={() => (buttonBg = '#005fcc')}
        on:focus={() => (buttonBg = '#005fcc')}
        on:mouseout={() => (buttonBg = '#0077ff')}
        on:blur={() => (buttonBg = '#0077ff')}
        style="background: {buttonBg}"
      >
        Convert to UPPERCASE
      </button>
    </div>
  </div>

   <!-- Form Example -->
   <div class="section form-section">
     <h2>📝 Contact Form (Form)</h2>
     <p class="form-description">
       This form uses the proper SvelteKit form remote function pattern with progressive enhancement.
     </p>
     
     <!-- Using the correct pattern: spread the form function -->
     <form {...submitMessage()} class="contact-form">
       <input
         name="name"
         type="text"
         placeholder="Your name"
         class="input"
         required
       />
       <textarea
         name="message"
         placeholder="Your message"
         class="textarea"
         rows="4"
         required
       ></textarea>
       <button type="submit" class="button primary">
         Submit Message
       </button>
     </form>

     <div class="form-info">
       <p><strong>🔄 Progressive Enhancement:</strong></p>
       <ul>
         <li>✅ Works without JavaScript (posts to server and reloads page)</li>
         <li>✅ Enhanced with JavaScript (submits without page reload)</li>
         <li>✅ Automatic form validation and error handling</li>
       </ul>
     </div>
   </div>

  <!-- Command Example -->
  <div class="section command-section">
    <h2>⚡ Activity Tracking (Command)</h2>
    <div class="command-buttons">
      <button
        class="button secondary"
        on:click={() => trackActivity('page_view')}
      >
        Log Page View
      </button>
      <button
        class="button secondary"
        on:click={() => trackActivity('button_click')}
      >
        Log Button Click
      </button>
      <button
        class="button secondary"
        on:click={() => trackActivity('user_interaction')}
      >
        Log User Interaction
      </button>
    </div>

    {#if commandResult}
      <div class="command-result">{commandResult}</div>
    {/if}
  </div>
</div>

<style>
  /* Global container */
  .demo-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
      sans-serif;
  }

  .demo-container h1 {
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

  /* Section styling */
  .section {
    background: #fff;
    border-radius: 12px;
    padding: 2rem;
    margin-bottom: 2rem;
    box-shadow: 0 2px 16px rgba(0, 0, 0, 0.1);
    border: 1px solid #e1e8ed;
  }

  .section h2 {
    margin-top: 0;
    margin-bottom: 1.5rem;
    color: #333;
    border-bottom: 2px solid #0077ff;
    padding-bottom: 0.5rem;
  }

  /* Prerender section */
  .info-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 1.5rem;
  }

  .info-card {
    background: #f8f9fa;
    border-radius: 8px;
    padding: 1.5rem;
    border: 1px solid #e9ecef;
  }

  .info-card h3 {
    margin-top: 0;
    margin-bottom: 1rem;
    color: #495057;
  }

  .info-card p {
    margin: 0.5rem 0;
    color: #333;
  }

  .info-card small {
    color: #6c757d;
    font-size: 0.875rem;
  }

  /* Query section */
  .converter {
    display: flex;
    gap: 1rem;
    align-items: center;
    flex-wrap: wrap;
  }

   /* Form section */
   .form-description {
     color: #666;
     margin-bottom: 1rem;
     font-style: italic;
   }
   
   .contact-form {
     display: flex;
     flex-direction: column;
     gap: 1rem;
     max-width: 500px;
     margin-bottom: 1.5rem;
   }
   
   .form-info {
     background: #f8f9fa;
     border: 1px solid #e9ecef;
     border-radius: 8px;
     padding: 1rem;
     margin-top: 1rem;
   }
   
   .form-info p {
     margin-top: 0;
     margin-bottom: 0.5rem;
   }
   
   .form-info ul {
     margin-bottom: 0;
     padding-left: 1.5rem;
   }
   
   .form-info li {
     margin-bottom: 0.25rem;
   }

  .result {
    margin-top: 1.5rem;
    padding: 1rem;
    border-radius: 8px;
    border: 1px solid;
  }

  .result.success {
    background-color: #d4edda;
    border-color: #c3e6cb;
    color: #155724;
  }

  .result.error {
    background-color: #f8d7da;
    border-color: #f5c6cb;
    color: #721c24;
  }

  .result h4 {
    margin-top: 0;
    margin-bottom: 0.5rem;
  }

  .result p {
    margin: 0.25rem 0;
  }

  /* Command section */
  .command-buttons {
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
    margin-bottom: 1rem;
  }

  .command-result {
    padding: 0.75rem;
    background: #e3f2fd;
    border: 1px solid #bbdefb;
    border-radius: 6px;
    color: #0d47a1;
    font-weight: 500;
  }

  /* Input styling */
  .input,
  .textarea {
    padding: 0.75rem;
    border: 1px solid #ced4da;
    border-radius: 6px;
    font-size: 1rem;
    transition:
      border-color 0.15s ease-in-out,
      box-shadow 0.15s ease-in-out;
  }

  .input:focus,
  .textarea:focus {
    outline: 0;
    border-color: #0077ff;
    box-shadow: 0 0 0 2px rgba(0, 119, 255, 0.25);
  }

  .textarea {
    resize: vertical;
    min-height: 100px;
    font-family: inherit;
  }

  /* Button styling */
  .button {
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 6px;
    font-size: 1rem;
    cursor: pointer;
    transition: all 0.2s ease-in-out;
    font-weight: 500;
    text-decoration: none;
    display: inline-block;
    text-align: center;
  }

  .button.primary {
    background: #0077ff;
    color: #fff;
  }

  .button.primary:hover:not(:disabled) {
    background: #005fcc;
    transform: translateY(-1px);
  }

  .button.secondary {
    background: #6c757d;
    color: #fff;
  }

  .button.secondary:hover:not(:disabled) {
    background: #545b62;
    transform: translateY(-1px);
  }

  .button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none !important;
  }

  /* Responsive design */
  @media (max-width: 768px) {
    .demo-container {
      padding: 1rem;
    }

    .section {
      padding: 1.5rem;
    }

    .converter {
      flex-direction: column;
      align-items: stretch;
    }

    .command-buttons {
      flex-direction: column;
    }

    .info-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
