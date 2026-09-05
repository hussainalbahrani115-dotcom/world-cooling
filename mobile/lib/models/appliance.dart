class Appliance {
  final String id;
  final String nameAr;
  final String nameEn;
  final String category;
  final String? imageUrl;

  Appliance({
    required this.id,
    required this.nameAr,
    required this.nameEn,
    required this.category,
    this.imageUrl,
  });

  factory Appliance.fromJson(Map<String, dynamic> json) {
    return Appliance(
      id: json['id'] as String,
      nameAr: json['nameAr'] as String,
      nameEn: json['nameEn'] as String,
      category: json['category'] as String,
      imageUrl: json['imageUrl'] as String?,
    );
  }
}

class Symptom {
  final String id;
  final String applianceId;
  final String title;
  final String? description;

  Symptom({
    required this.id,
    required this.applianceId,
    required this.title,
    this.description,
  });

  factory Symptom.fromJson(Map<String, dynamic> json) {
    return Symptom(
      id: json['id'] as String,
      applianceId: json['applianceId'] as String,
      title: json['title'] as String,
      description: json['description'] as String?,
    );
  }
}
