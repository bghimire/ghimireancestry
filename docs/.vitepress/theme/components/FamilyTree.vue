<script setup>
import { ref, onMounted } from 'vue'

const selected = ref(null)
const width = 1000
const height = 700
const nodes = ref([])
const links = ref([])

const data = {
  name: 'Great Grandpa',
  children: [
    { name: 'Son 1', children: [
      { name: 'S1-G1' },
      { name: 'S1-G2' },
      { name: 'S1-G3', children: [
        { name: 'S1-G3-S1' },
        { name: 'S1-G3-S2', children: [
          { name: 'S1-G3-S2-D1' }
        ] },
        { name: 'S1-G3-S3', children: [
          { name: 'S1-G3-S3-S1' },
          { name: 'S1-G3-S3-D1' }
        ] },
        { name: 'S1-G3-S4', children: [
          { name: 'S1-G3-S4-D1' }
        ] }
      ] },
      { name: 'S1-G4' },
      { name: 'S1-G5' },
      { name: 'S1-G6' }
    ]},
    { name: 'Son 2' }, { name: 'Son 3' }, { name: 'Son 4' }, { name: 'Son 5' }, { name: 'Son 6' }, { name: 'Son 7' }, { name: 'Son 8' }, { name: 'Son 9' }
  ]
}

function build() {
  const tempNodes = []
  const tempLinks = []
  let id = 0

  function walk(node, parent, depth) {
    const curId = id++
    let x
    if (depth === 0) {
      x = width / 2
    } else if (depth === 1) {
      const siblings = data.children
      const idx = siblings.indexOf(node)
      const total = siblings.length
      x = width / 2 + (idx - (total - 1) / 2) * 80
    } else if (depth === 2) {
      const siblings = parent.children
      const idx = siblings.indexOf(node)
      const total = siblings.length
      x = parent.x + (idx - (total - 1) / 2) * 70
    } else if (depth === 3) {
      const siblings = parent.children
      const idx = siblings.indexOf(node)
      const total = siblings.length
      x = parent.x + (idx - (total - 1) / 2) * 60
    } else if (depth === 4) {
      const siblings = parent.children
      const idx = siblings.indexOf(node)
      const total = siblings.length
      x = parent.x + (idx - (total - 1) / 2) * 50
    } else {
      x = parent.x
    }
    const y = 80 + depth * 100
    const n = { id: curId, name: node.name, short: node.name.length > 12 ? node.name.slice(0, 10) + '...' : node.name, children: node.children || [], parent, x, y, depth, highlighted: false }
    tempNodes.push(n)
    if (parent) {
      tempLinks.push({ source: parent, target: n, highlighted: false })
    }
    if (node.children) {
      node.children.forEach(c => walk(c, n, depth + 1))
    }
  }
  walk(data, null, 0)
  nodes.value = tempNodes
  links.value = tempLinks
}

function selectNode(node) {
  selected.value = node
  nodes.value.forEach(n => { n.highlighted = false })
  links.value.forEach(l => { l.highlighted = false })
  let cur = node
  const set = new Set()
  while (cur) {
    set.add(cur.id)
    cur = cur.parent
  }
  function addDesc(n) {
    if (!n.children) return
    n.children.forEach(c => {
      const child = nodes.value.find(x => x.parent === n && x.name === c.name)
      if (child) {
        set.add(child.id)
        addDesc(child)
      }
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
          style="cursor: pointer"
        >
          <circle
            :cx="node.x"
            :cy="node.y"
            r="24"
            :class="{ 'selected': selected === node, 'highlighted': node.highlighted }"
          />
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
.node-group circle { fill: #4a90e2; stroke: #2c5aa0; stroke-width: 2; transition: all 0.2s; }
.node-group circle.selected { fill: #e24a4a; stroke: #a02c2c; r: 28; }
.node-group circle.highlighted { fill: #50c878; stroke: #2d8b57; filter: drop-shadow(0 0 4px rgba(80,200,120,0.6)); }
.node-group text { pointer-events: none; user-select: none; }
line { transition: all 0.2s; }
line.highlighted { stroke: #50c878; stroke-width: 3; }
</style>
