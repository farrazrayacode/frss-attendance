<script lang="ts">
  export let title: string = '';
  export let value: number | string = 0;
  export let iconColor: string = 'bg-blue-500';
</script>

<div class="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
  <div class="p-3 {iconColor} text-white rounded-lg">
    <slot name="icon" />
  </div>
  <div>
    <h3 class="text-2xl font-bold text-gray-900">{value}</h3>
    <p class="text-xs font-medium text-gray-500">{title}</p>
  </div>
</div>