package com.thalesgroup.isra.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "risk_attack_paths")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RiskAttackPath {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "risk_id", nullable = false)
    @JsonIgnore
    private Risk risk;

    @Column(name = "attack_path_id", nullable = false)
    private Integer attackPathId;

    @Column(name = "attack_path_name", length = 512)
    private String attackPathName;

    @Column(name = "attack_path_score")
    private Double attackPathScore;

    @OneToMany(mappedBy = "attackPath", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<RiskVulnerabilityRef> vulnerabilityRefs = new ArrayList<>();
}
