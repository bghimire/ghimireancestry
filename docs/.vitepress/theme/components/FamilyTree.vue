<script setup>
import { ref, onMounted } from 'vue'

const selected = ref(null)
const width = 1100
const height = 800
const nodes = ref([])
const links = ref([])

const data = {
  name: 'Great Grandpa',
  sex: 'M',
  children: [
    { name: 'Son 1', sex: 'M', children: [
      { name: 'Sadhuram', sex: 'M' },
      { name: 'Sister 1', sex: 'F' },
      { name: 'Gyanendra', sex: 'M', children: [
        { name: 'S1-G3-S1', sex: 'M' },
        { name: 'S1-G3-S2', sex: 'M', children: [
          { name: 'S1-G3-S2-D1', sex: 'F' }
        ] },
        { name: 'S1-G3-S3', sex: 'M', children: [
          { name: 'S1-G3-S3-S1', sex: 'M' },
          { name: 'S1-G3-S3-D1', sex: 'F' }
        ] },
        { name: 'S1-G3-S4', sex: 'M', children: [
          { name: 'S1-G3-S4-D1', sex: 'F' }
        ] }
      ] },
      { name: 'Sister 2', sex: 'F' },
      { name: 'Bhim Prasad', sex: 'M' }
    ]},
    { name: 'Son 2', sex: 'M' }, { name: 'Son 3', sex: 'M' }, { name: 'Son 4', sex: 'M' }, { name: 'Son 5', sex: 'M' }, { name: 'Son 6', sex: 'M' }, { name: 'Son 7', sex: 'M' }, { name: 'Son 8', sex: 'M' }, { name: 'Son 9', sex: 'M' }
  ]
}

function build() {
  const tempNodes = []
  const tempLinks = []
  let id = 0

  function walk(node, parent, depth, siblings) {
    const curId = id++
    let x
    if (depth === 0) {
      x = width / 2
    } else {
      const idx = siblings.indexOf(node)
      const total = siblings.length
      const spacing = depth === 1 ? 85 : depth === 2 ? 80 : depth === 3 ? 70 : 65
      x = parent.x + (idx - (total - 1) / 2) * spacing
    }
    const y = 90 + depth * 95
    const n = {
      id: curId,
      name: node.name,
      short: node.name.length > 14 ? node.name.slice(0, 13) + '…' : node.name,
      sex: node.sex || 'M',
      parent,
      x,
      y,
      depth,
      highlighted: false,
      children: []
    }
    tempNodes.push(n)
    if (parent) {
      tempLinks.push({ source: parent, target: n, highlighted: false })
    }
    if (node.children) {
      node.children.forEach(c => n.children.push(walk(c, n, depth + 1, node.children)))
    }
    return n
  }
  walk(data, null, 0, [data])
  nodes.value = tempNodes
  links.value = tempLinks
}

function selectNode(node) {
  selected.value = node
  nodes.value.forEach(n => { n.highlighted = false })
  links.value.forEach(l => { l.highlighted = false })
  const set = new Set()
  let cur = node
  while (cur) {
    set.add(cur.id)
    cur = cur.parent
  }
  function addDesc(n) {
    n.children.forEach(c => {
      set.add(c.id)
      addDesc(c)
    })
  }
  addDesc(node)
  nodes.value.forEach(n => { if (set.has(n.id)) n.highlighted = true })
  links.value.forEach(l => { if (set.has(l.target.id)) l.highlighted = true })
}

onMounted(() => {
  build()
})
</script>

<template>
  <div class="tree-container">
    <svg :width="width" :height="height" class="tree-svg">
      <g>
        <line
          v-for="(link, i) in links"
          :key="i"
          :x1="link.source.x"
          :y1="link.source.y"
          :x2="link.target.x"
          :y2="link.target.y"
          stroke="#999"
          stroke-width="2"
          :class="{ 'highlighted': link.highlighted }"
        />
        <g
          v-for="(node, i) in nodes"
          :key="i"
          @click="selectNode(node)"
          class="node-group"
          :class="{ selected: selected === node, highlighted: node.highlighted }"
          style="cursor: pointer"
        >
          <circle v-if="node.sex === 'M'" :cx="node.x" :cy="node.y" r="26" class="ring" />
          <template v-if="node.sex === 'F'">
            <circle :cx="node.x" :cy="node.y" r="26" class="ring" />
            <circle :cx="node.x" :cy="node.y" r="30" class="ring" />
          </template>
          <circle :cx="node.x" :cy="node.y" r="21" class="base" />
          <text
            :x="node.x"
            :y="node.y + 4"
            text-anchor="middle"
            font-size="9"
            fill="#fff"
          >
            {{ node.short }}
          </text>
        </g>
      </g>
    </svg>
  </div>
</template>

<style scoped>
.tree-container { overflow-x: auto; padding: 20px 0; }
.tree-svg { border: 1px solid var(--vp-c-divider); border-radius: 8px; }
.node-group .base { fill: #4a90e2; stroke: #2c5aa0; stroke-width: 2; transition: all 0.2s; }
.node-group .ring { fill: none; stroke: #0d47a1; stroke-width: 2.5; transition: all 0.2s; }
.node-group.selected .base { fill: #e24a4a; stroke: #a02c2c; }
.node-group.selected .ring { stroke: #b71c1c; }
.node-group.highlighted .base { fill: #50c878; stroke: #2d8b57; filter: drop-shadow(0 0 4px rgba(80,200,120,0.6)); }
.node-group.highlighted .ring { stroke: #1b5e20; }
.node-group text { pointer-events: none; user-select: none; }
line { transition: all 0.2s; }
line.highlighted { stroke: #50c878; stroke-width: 3; }
</style>
