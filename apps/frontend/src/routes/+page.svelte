<script lang="ts">
    import { toUpper } from '$lib/all.remote';

    let message = $state('Hello, world!');
    let buttonBg = $state('#0077ff');
    let buttonEl: HTMLButtonElement;
</script>

<div class="converter-container">
    <h2>Uppercase Converter</h2>
    <input
        type="text"
        bind:value={message}
        placeholder="Enter text"
        class="converter-input"
    />
    <button
        onclick={async () => { message = await toUpper(message); }}
        class="converter-button"
        onmouseover={() => (buttonBg = '#005fcc')}
        onfocus={() => (buttonBg = '#005fcc')}
        onmouseout={() => (buttonBg = '#0077ff')}
        onblur={() => (buttonBg = '#0077ff')}
        style="background: {buttonBg}"
        bind:this={buttonEl}
    >
        Convert to UPPERCASE
    </button>
</div>


<style>
.converter-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    max-width: 400px;
    margin: 2rem auto;
    padding: 2rem;
    border-radius: 12px;
    box-shadow: 0 2px 16px #0001;
    background: #fff;
}
.converter-container h2 {
    margin: 0;
}
.converter-input {
    padding: 0.5rem 1rem;
    border: 1px solid #ccc;
    border-radius: 6px;
    width: 100%;
    font-size: 1rem;
}
.converter-button {
    padding: 0.5rem 1.5rem;
    background: #0077ff;
    color: #fff;
    border: none;
    border-radius: 6px;
    font-size: 1rem;
    cursor: pointer;
    transition: background 0.2s;
}
.converter-button:hover {
    background: #005fcc;
}
</style>
