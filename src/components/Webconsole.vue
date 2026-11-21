<template>
    <div ref="terminalContainer" class="h-full w-full" />
</template>
  
<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { Terminal } from 'xterm'
import 'xterm/css/xterm.css'

const props = defineProps({
  idServer: String,
  ip: String,
  port: Number
})

const terminalContainer = ref<HTMLDivElement | null>(null)
let terminal: Terminal
let socket: WebSocket
  
const initTerminal = () => {
    terminal = new Terminal({
      fontFamily: "'JetBrains Mono', ui-monospace, monospace",
      fontSize: 13,
      lineHeight: 1.35,
      cursorBlink: true,
      theme: {
        background: "#06070a",
        foreground: "#d4d8de",
        cursor: "#818cf8",
        selectionBackground: "#6366f155",
        black: "#1d222c",
        brightBlack: "#5d6573"
      }
    })
  
    terminal.open(terminalContainer.value!)
    terminal.focus()
  
    terminal.onData(data => {
      if (socket.readyState === WebSocket.OPEN) {
        socket.send(data)
      }
    })
}
  
const connectWebSocket = () => {
  console.log(props.ip)
  console.log(props.port)
    socket = new WebSocket(`ws://${props.ip}:${props.port}`)
  
    socket.onopen = () => {
      terminal.write('\r\n[✅ Connecté au VPS]')
    }
  
    socket.onmessage = (event) => {
      terminal.write(event.data)
    }
  
    socket.onclose = () => {
      terminal.write('\r\n[⚠️ Déconnecté]')
    }
  
    socket.onerror = () => {
      terminal.write('\r\n[⛔️ Erreur WebSocket]')
    }
}
  
onMounted(() => {
    initTerminal()
    connectWebSocket()
})
  
onBeforeUnmount(() => {
    socket?.close()
    terminal?.dispose()
})
</script>