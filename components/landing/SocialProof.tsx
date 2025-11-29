'use client'

interface Review {
  id: number
  name: string
  role: string
  avatar: string
  content: string
  span: string
}

export function SocialProof() {
  const reviews: Review[] = [
    {
      id: 1,
      name: 'Dimas Suryono',
      role: 'Freelance Designer',
      avatar: 'https://i.pravatar.cc/150?u=1',
      content:
        'Jujur ini game changer. Biasanya males nyatet karena harus buka app, klik kategori, ketik harga. Sekarang tinggal ngomong pas lagi jalan.',
      span: 'md:col-span-2',
    },
    {
      id: 2,
      name: 'Sarah Wijaya',
      role: 'Mahasiswa',
      avatar: 'https://i.pravatar.cc/150?u=2',
      content:
        "Deteksi 'pakai Gopay' atau 'pakai Cash' nya akurat banget. Gak perlu milih wallet lagi manual.",
      span: 'col-span-1',
    },
    {
      id: 3,
      name: 'Budi Santoso',
      role: 'Small Business Owner',
      avatar: 'https://i.pravatar.cc/150?u=3',
      content:
        'Simpel, cepet, dan UI-nya gak norak. Jarang nemu app lokal kualitas begini.',
      span: 'col-span-1',
    },
    {
      id: 4,
      name: 'Jessica Tan',
      role: 'Marketing Lead',
      avatar: 'https://i.pravatar.cc/150?u=4',
      content:
        'Fitur AI-nya beneran pinter, bukan gimmick doang. Salah ngomong dikit dia tetep ngerti konteksnya.',
      span: 'md:col-span-2',
    },
  ]

  return (
    <section id="reviews" className="py-20 md:py-32 relative">
      <div className="max-w-5xl mx-auto px-6">
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white mb-12">
          Apa kata early users?
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {reviews.map((review) => (
            <div
              key={review.id}
              className={`bg-zinc-900/50 border border-zinc-800/50 p-6 rounded-2xl hover:border-zinc-700 transition-all duration-300 hover:-translate-y-1 ${review.span || 'col-span-1'}`}
            >
              <div className="flex items-center gap-3 mb-4">
                <img
                  src={review.avatar}
                  alt={review.name}
                  className="w-10 h-10 rounded-full grayscale opacity-80"
                />
                <div>
                  <h4 className="text-sm font-medium text-white">
                    {review.name}
                  </h4>
                  <p className="text-xs text-zinc-500">{review.role}</p>
                </div>
              </div>
              <p className="text-zinc-400 text-sm leading-relaxed">
                "{review.content}"
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
