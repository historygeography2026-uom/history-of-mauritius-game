import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Mail } from "lucide-react"

export default function SignUpSuccessPage() {
  return (
    <div className="min-h-screen bg-transparent flex items-center justify-center p-4 relative z-10">
      <div className="w-full max-w-md">
        <Card className="kid-card border-green-400/40 bg-white/90 backdrop-blur-sm">
          <CardHeader className="text-center">
            <div className="text-5xl mb-3 animate-bounce-gentle">📬</div>
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 border-2 border-primary/20">
              <Mail className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl kid-heading">Check Your Email! 📧</CardTitle>
            <CardDescription>We&apos;ve sent you a confirmation link</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-sm text-muted-foreground mb-6">
              Please check your email and click the confirmation link to activate your account. Once confirmed, you can
              log in and start learning! 🎓
            </p>
            <Link href="/auth/login">
              <Button className="kid-btn w-full bg-gradient-to-r from-primary to-blue-600 text-white py-3 text-lg">🔑 Go to Login</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
