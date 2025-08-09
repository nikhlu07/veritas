import { Button } from "../ui/button";

export const FinalCTASection = (): JSX.Element => {
  return (
    <section className="py-16 bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23059669%22%20fill-opacity%3D%220.1%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%221%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-50"></div>

      {/* Gradient Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl"></div>

      <div className="relative z-10 max-w-4xl mx-auto px-6 lg:px-8 text-center">
        <h2 className="text-3xl md:text-5xl font-black text-white mb-6 leading-tight">
          Ready to Build Trust?
        </h2>

        <p className="text-lg md:text-xl text-slate-300 mb-8 max-w-2xl mx-auto leading-relaxed">
          Start your journey towards transparent and verifiable product claims with Veritas.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
          <Button className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-3 text-lg font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
            Get Started
          </Button>
          <Button 
            variant="outline" 
            className="border-2 border-slate-400 text-slate-300 hover:text-white hover:border-white px-8 py-3 text-lg font-semibold rounded-lg bg-transparent backdrop-blur-sm transition-all duration-300"
          >
            Learn More
          </Button>
        </div>

        {/* Simple footer info */}
        <div className="pt-8 border-t border-slate-700/50">
          <p className="text-slate-400 text-sm">
            © 2024 Veritas. Powered by Hedera Network.
          </p>
        </div>
      </div>
    </section>
  );
};