/* =========================================
   تسجيل دخول الإدارة
   دوري ميدي للمحترفين 2026
   ========================================= */

const ADMIN_UID = "91807e41-d5da-46b8-a6e6-7a8b07a40779";

const loginForm = document.getElementById("adminLoginForm");
const emailInput = document.getElementById("adminEmail");
const passwordInput = document.getElementById("adminPassword");
const loginButton = document.getElementById("adminLoginButton");
const messageBox = document.getElementById("adminLoginMessage");


function showMessage(message, type = "") {

    messageBox.textContent = message;
    messageBox.className = "admin-login-message";

    if (type) {
        messageBox.classList.add(type);
    }
}


loginForm.addEventListener("submit", async function (event) {

    event.preventDefault();

    const email = emailInput.value.trim();
    const password = passwordInput.value;

    if (!email || !password) {

        showMessage(
            "أدخل البريد الإلكتروني وكلمة المرور.",
            "error"
        );

        return;
    }


    loginButton.disabled = true;
    loginButton.textContent = "جاري تسجيل الدخول...";

    showMessage("");


    try {

        const { data, error } =
            await supabaseClient.auth.signInWithPassword({
                email: email,
                password: password
            });


        if (error) {

            console.error(
                "خطأ تسجيل الدخول:",
                error
            );

            showMessage(
                "البريد الإلكتروني أو كلمة المرور غير صحيحة.",
                "error"
            );

            return;
        }


        if (!data || !data.user) {

            showMessage(
                "تعذر التحقق من حساب الإدارة.",
                "error"
            );

            return;
        }


        /* =========================
           التحقق من حساب الإدارة
           ========================= */

        if (data.user.id !== ADMIN_UID) {

            await supabaseClient.auth.signOut();

            showMessage(
                "هذا الحساب ليس لديه صلاحية دخول الإدارة.",
                "error"
            );

            return;
        }


        /* =========================
           الدخول إلى لوحة الإدارة
           ========================= */

        showMessage(
            "تم تسجيل الدخول بنجاح...",
            "success"
        );


        setTimeout(function () {

            window.location.href = "admin-panel.html";

        }, 700);


    } catch (error) {

        console.error(
            "خطأ غير متوقع:",
            error
        );

        showMessage(
            "حدث خطأ غير متوقع. حاول مرة أخرى.",
            "error"
        );

    } finally {

        loginButton.disabled = false;
        loginButton.textContent = "دخول الإدارة";

    }

});
