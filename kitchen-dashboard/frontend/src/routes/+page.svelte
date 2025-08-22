<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import OrderList from "../lib/OrderList.svelte";
  import {
    visibleOrdersStore,
    ordersActions,
    type Order,
  } from "../lib/stores/orders";

  // Accept SSR data
  export let data: { orders: Order[] };

  $: pendingOrders = $visibleOrdersStore.filter((o: Order) => !o.isCompleted);
  let eventSource: EventSource | null = null;

  async function handleUpdateOrder(
    orderId: number,
    orderStatus: "Pending" | "Received" | "Completed"
  ) {
    await ordersActions.updateOrder(orderId, orderStatus);
  }

  onMount(() => {
    if ($visibleOrdersStore.length === 0 && data.orders?.length > 0) {
      ordersActions.initialize(data.orders);
    }

    function connectSSE() {
      if (eventSource) {
        eventSource.close();
      }

      eventSource = new EventSource("/api/orders/stream");

      eventSource.onopen = () => {
        console.log("SSE connection established");
      };

      eventSource.onmessage = (event) => {
        try {
          const orderUpdate = JSON.parse(event.data);
          ordersActions.handleOrderUpdate(orderUpdate);
        } catch (error) {
          console.error("Error parsing SSE data:", error);
        }
      };

      eventSource.onerror = (error) => {
        console.error("SSE connection error:", error);
        eventSource?.close();

        console.log("Reconnecting in 3 seconds...");
        setTimeout(() => {
          connectSSE();
        }, 3000);
      };
    }

    // Initial connection
    connectSSE();

    // Check connection health every 10 seconds and reconnect if needed
    const healthCheck = setInterval(() => {
      if (!eventSource || eventSource.readyState === EventSource.CLOSED) {
        console.log("Connection lost, reconnecting...");
        connectSSE();
      }
    }, 10000);

    return () => {
      clearInterval(healthCheck);
    };
  });

  onDestroy(() => {
    if (eventSource) {
      eventSource.close();
    }
  });
</script>

<main>
  <div class="orders-container">
    <div class="order-list-title">
      <h2>Pending Orders</h2>
      <span class="svg-spinners--gooey-balls-2"></span>
    </div>

    <OrderList orders={pendingOrders} {handleUpdateOrder} />
  </div>
</main>
