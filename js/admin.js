/* =========================================
   تسجيل دخول الإدارة
   دوري ميدي للمحترفين 2026
   ========================================= */

document.addEventListener("DOMContentLoaded", function () {

    const ADMIN_UID =
        "91807e41-d5da-46b8-a6e6-7a8b07a40779";

    const loginForm =
        document.getElementById("adminLoginForm");

    const emailInput =
        document.getElementById("adminEmail");

    const passwordInput =
        document.getElementById("adminPassword");

    const loginButton =
        document.getElementById("adminLoginButton");

    const messageBox =
        document.getElementById("adminLoginMessage");


    /* =========================
       التأكد من وجود العناصر
       ========================= */

    if (!loginForm) {
        console.error("لم يتم العثور على نموذج تسجيل الدخول.");
        return;
    }

    if (!emailInput || !passwordInput || !loginButton) {
        console.error("عناصر تسجيل الدخول ناقصة.");
        return;
    }


    /* =========================
       عرض الرسائل
       ========================= */

    function showMessage(message, type = "") {

        if (!messageBox) return;

        messageBox.textContent = message;
        messageBox.className =
            "admin-login-message";

        if (type) {
            messageBox.classList.add(type);
        }
    }


    /* =========================
       تسجيل الدخول
       ========================= */

    loginForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            const email =
                emailInput.value.trim();

            const password =
                passwordInput.value;


            if (!email || !password) {

                showMessage(
                    "أدخل البريد الإلكتروني وكلمة المرور.",
                    "error"
                );

                return;
            }


            loginButton.disabled = true;
            loginButton.textContent =
                "جاري تسجيل الدخول...";


            showMessage("");


            try {

                /* التأكد من وجود Supabase */

                if (
                    typeof supabaseClient === "undefined"
                ) {

                    throw new Error(
                        "supabaseClient غير موجود."
                    );
                }


                /* تسجيل الدخول */

                const {
                    data,
                    error
                } =
                    await supabaseClient.auth
                        .signInWithPassword({
                            email: email,
                            password: password
                        });


                if (error) {

                    console.error(
                        "Supabase Login Error:",
                        error
                    );

                    showMessage(
                        error.message ||
                        "فشل تسجيل الدخول.",
                        "error"
                    );

                    return;
                }


                if (!data || !data.user) {

                    showMessage(
                        "لم يتم العثور على حساب المستخدم.",
                        "error"
                    );

                    return;
                }


                /* =========================
                   التحقق من حساب الإدارة
                   ========================= */

                if (
                    data.user.id !== ADMIN_UID
                ) {

                    await supabaseClient.auth.signOut();

                    showMessage(
                        "هذا الحساب ليس حساب الإدارة.",
                        "error"
                    );

                    return;
                }


                /* =========================
                   نجاح الدخول
                   ========================= */

                showMessage(
                    "تم تسجيل الدخول بنجاح...",
                    "success"
                );


                window.location.href =
                    "admin-panel.html";

            }


            catch (error) {

                console.error(
                    "Admin Login Error:",
                    error
                );

                showMessage(
                    error.message ||
                    "حدث خطأ أثناء تسجيل الدخول.",
                    "error"
                );

            }


            finally {

                loginButton.disabled = false;

                loginButton.textContent =
                    "دخول الإدارة";

            }

        }
    );


    console.log(
        "صفحة تسجيل دخول الإدارة جاهزة."
    );

});
