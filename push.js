const PUSH_SUPABASE_URL = "https://ddqjdcurwlffsmrkcylo.supabase.co";
const PUSH_SUPABASE_KEY = "sb_publishable_OuHtmXoZZGqj46tD1Top6A_hmnz5f1o";

const VAPID_PUBLIC_KEY =
    "BMzwYO9ZmdhAcWE4tGJeSP0HqO9OOR1ylBmsxYtMHXprC2UWMIvf5fGoy3ZGhaeqSa5440DkO4-fQPw6yqZPSg8";


function urlBase64ToUint8Array(base64String) {
    const padding = "=".repeat((4 - base64String.length % 4) % 4);

    const base64 = (base64String + padding)
        .replace(/-/g, "+")
        .replace(/_/g, "/");

    const rawData = window.atob(base64);

    return Uint8Array.from(
        [...rawData].map(char => char.charCodeAt(0))
    );
}


async function enablePushNotifications() {

    try {

        if (!("serviceWorker" in navigator)) {
            alert("المتصفح لا يدعم الإشعارات.");
            return;
        }

        if (!("PushManager" in window)) {
            alert("المتصفح لا يدعم Push Notifications.");
            return;
        }

        const permission = await Notification.requestPermission();

        if (permission !== "granted") {
            console.log("Notification permission denied.");
            return;
        }

        const registration =
            await navigator.serviceWorker.ready;

        let subscription =
            await registration.pushManager.getSubscription();

        if (!subscription) {

            subscription =
                await registration.pushManager.subscribe({
                    userVisibleOnly: true,

                    applicationServerKey:
                        urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
                });
        }

        const subscriptionData = subscription.toJSON();

        const supabase = window.supabase.createClient(
            PUSH_SUPABASE_URL,
            PUSH_SUPABASE_KEY
        );

        const {
            data: { user },
            error: userError
        } = await supabase.auth.getUser();

        if (userError || !user) {
            console.log("لم يتم العثور على المستخدم.");
            return;
        }

        const { error } = await supabase
            .from("push_subscriptions")
            .upsert({
                user_id: user.id,
                endpoint: subscriptionData.endpoint,
                p256dh: subscriptionData.keys.p256dh,
                auth: subscriptionData.keys.auth
            }, {
                onConflict: "endpoint"
            });

        if (error) {
            console.error("Push subscription error:", error);
            return;
        }

        console.log("Push Notifications enabled successfully ✅");

    } catch (error) {

        console.error(
            "Error enabling push notifications:",
            error
        );

    }
}